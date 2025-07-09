class AdvancedMemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.movesElement = document.getElementById('moves');
        this.streakElement = document.getElementById('streak');
        this.progressFill = document.getElementById('progressFill');
        this.modal = document.getElementById('gameModal');
        
        this.emojiCodes = {
            easy: ['1F3AE', '1F3AF', '1F3A8', '1F3AA', '1F3AD', '1F3B8', '1F3BA', '1F3B2'],
            medium: ['1F680', '2B50', '1F319', '2600', '1F308', '26A1', '1F525', '1F48E', '1F38A', '1F381'],
            hard: ['1F984', '1F409', '1F98B', '1F338', '1F340', '1F4AB', '1F3AD', '1F3AA', '1F3A8', '1F3AF', '1F3AE', '1F3B8']
        };
        
        this.difficulty = 'easy';
        this.gameCards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.streak = 0;
        this.timer = 0;
        this.gameTimer = null;
        this.isPaused = false;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDifficulty();
        this.startNewGame();
    }
    
    setupEventListeners() {
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeDifficulty(e.target.dataset.level));
        });
        
        document.getElementById('restart').addEventListener('click', () => this.startNewGame());
        document.getElementById('pause').addEventListener('click', () => this.togglePause());
        document.getElementById('playAgain').addEventListener('click', () => this.startNewGame());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    }
    
    changeDifficulty(level) {
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-level="${level}"]`).classList.add('active');
        this.difficulty = level;
        this.setupDifficulty();
        this.startNewGame();
    }
    
    setupDifficulty() {
        const cards = this.emojiCodes[this.difficulty];
        const pairs = this.difficulty === 'easy' ? 8 : this.difficulty === 'medium' ? 10 : 12;
        this.cards = cards.slice(0, pairs);
        this.gameCards = [...this.cards, ...this.cards];
        this.gameBoard.className = `game-board ${this.difficulty}`;
    }
    
    startNewGame() {
        this.closeModal();
        clearInterval(this.gameTimer);
        this.resetStats();
        this.shuffle();
        this.createBoard();
        this.startTimer();
        this.updateProgress();
    }
    
    resetStats() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.streak = 0;
        this.timer = 0;
        this.isPaused = false;
        this.startTime = Date.now();
        this.updateDisplay();
    }
    
    shuffle() {
        for (let i = this.gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameCards[i], this.gameCards[j]] = [this.gameCards[j], this.gameCards[i]];
        }
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        this.gameCards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="card-front">
                    <img src="https://openmoji.org/data/color/svg/2728.svg" alt="✨" class="card-icon">
                </div>
                <div class="card-back">
                    <img src="https://openmoji.org/data/color/svg/${symbol}.svg" alt="emoji" class="card-icon">
                </div>
            `;
            card.addEventListener('click', () => this.flipCard(card, index));
            this.gameBoard.appendChild(card);
        });
    }
    
    flipCard(card, index) {
        if (this.isPaused || card.classList.contains('flipped') || 
            card.classList.contains('matched') || this.flippedCards.length === 2) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push({ card, index, symbol: this.gameCards[index] });
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            setTimeout(() => this.checkMatch(), 800);
        }
    }
    
    checkMatch() {
        const [first, second] = this.flippedCards;
        
        if (first.symbol === second.symbol) {
            first.card.classList.add('matched');
            second.card.classList.add('matched');
            this.matchedPairs++;
            this.streak++;
            
            const baseScore = this.difficulty === 'easy' ? 100 : 
                            this.difficulty === 'medium' ? 150 : 200;
            const streakBonus = this.streak * 50;
            const timeBonus = Math.max(0, 300 - this.timer) * 2;
            
            this.score += baseScore + streakBonus + timeBonus;
            
            this.updateDisplay();
            this.updateProgress();
            
            if (this.matchedPairs === this.cards.length) {
                setTimeout(() => this.gameWon(), 500);
            }
        } else {
            this.streak = 0;
            first.card.classList.remove('flipped');
            second.card.classList.remove('flipped');
            this.updateDisplay();
        }
        
        this.flippedCards = [];
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateDisplay();
            }
        }, 1000);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause');
        pauseBtn.innerHTML = this.isPaused ? 
            '<span class="btn-icon">▶️</span>Resume' : 
            '<span class="btn-icon">⏸️</span>Pause';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score.toLocaleString();
        this.movesElement.textContent = this.moves;
        this.streakElement.textContent = this.streak;
        
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        const progress = (this.matchedPairs / this.cards.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    gameWon() {
        clearInterval(this.gameTimer);
        
        const efficiency = Math.round((this.cards.length * 2 / this.moves) * 100);
        const timeScore = this.timer;
        
        document.getElementById('modalStats').innerHTML = `
            <div class="achievement-stat">
                <span>🏆 Final Score</span>
                <span>${this.score.toLocaleString()}</span>
            </div>
            <div class="achievement-stat">
                <span>⏱️ Time</span>
                <span>${Math.floor(timeScore / 60)}:${(timeScore % 60).toString().padStart(2, '0')}</span>
            </div>
            <div class="achievement-stat">
                <span>🎯 Moves</span>
                <span>${this.moves}</span>
            </div>
            <div class="achievement-stat">
                <span>📊 Efficiency</span>
                <span>${efficiency}%</span>
            </div>
            <div class="achievement-stat">
                <span>🔥 Best Streak</span>
                <span>${this.streak}</span>
            </div>
        `;
        
        this.showModal();
    }
    
    showModal() {
        this.modal.classList.add('show');
    }
    
    closeModal() {
        this.modal.classList.remove('show');
    }
}

new AdvancedMemoryGame();