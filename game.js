class MatchGrid {
    constructor(width, height, columns, rows, timeLimit, theme) {
        this.selectors = {
            boardContainer: document.getElementById('board-container'),
            movesCount: document.getElementById('moves'),
            timer: document.getElementById('timer'),
            start: document.getElementById('button-start'),
            reset: document.getElementById('button-reset'),
        };

        this.state = {
            gameStarted: false,
            flippedCards: 0,
            totalFlips: 0,
            totalTime: 0,
            loop: null,
        };

        this.width = width;
        this.height = height;
        this.columns = columns;
        this.rows = rows;
        this.timeLimit = timeLimit;
        this.theme = theme;
        
        this.attachEventListeners();
        this.generateGame();
        this.addMouseEnterLeaveListeners();
    }

    shuffle(array) {
        const clonedArray = [...array];
        for (let index = clonedArray.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const original = clonedArray[index];
            clonedArray[index] = clonedArray[randomIndex];
            clonedArray[randomIndex] = original;
        }
        return clonedArray;
    }

    pickRandom(array, items) {
        const clonedArray = [...array];
        const randomPicks = [];

        for (let index = 0; index < items; index++) {
            const randomIndex = Math.floor(Math.random() * clonedArray.length);

            randomPicks.push(clonedArray[randomIndex]);
            clonedArray.splice(randomIndex, 1);
        }

        return randomPicks;
    }

    generateGame() {
        // array for cards
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        const picks = this.pickRandom(numbers, (this.columns * this.rows) / 2);
        const items = this.shuffle([...picks, ...picks]);
        const cards = `
            <div class="board" style="grid-template-columns: repeat(${this.columns}, auto)">
                ${items
                    .map(
                        (item) => `
                        <div class="card">
                            <div class="card-front"></div>
                            <div class="card-back">${item}</div>
                        </div>
                    `
                    )
                    .join('')}
            </div>
        `;

        const parser = new DOMParser().parseFromString(cards, 'text/html');
        this.selectors.boardContainer.innerHTML = '';
        this.selectors.boardContainer.appendChild(parser.querySelector('.board'));
        this.selectors.reset.classList.add('disabled');
    }

    startGame() {
        this.state.gameStarted = true;
        this.selectors.start.classList.add('disabled');
        this.state.loop = setInterval(() => {
            this.state.totalTime++;
    
            this.selectors.movesCount.innerText = `${this.state.totalFlips} moves`;
            this.selectors.timer.innerText = `time: ${this.state.totalTime} sec`;
    
            if (this.state.totalTime >= this.timeLimit) {
                this.endGame(false);
            }
        }, 1000);
        this.selectors.reset.classList.remove('disabled');
    }

    endGame(isWin) {
        this.state.gameStarted = false;
        this.selectors.reset.classList.add('disabled');
        this.selectors.start.classList.remove('disabled');
    
        if (!isWin) {
            alert('You loose!');
        } 
        this.resetGame();
    }
    
    resetGame() {
        this.state.gameStarted = false;
        this.selectors.reset.classList.add('disabled');
        this.state.flippedCards = 0;
        this.state.totalFlips = 0;
        this.state.totalTime = 0;
        clearInterval(this.state.loop);
    
        this.selectors.boardContainer.innerHTML = '';
        this.generateGame();
        this.selectors.movesCount.innerText = `${this.state.totalFlips} moves`;
        this.selectors.timer.innerText = `time: ${this.state.totalTime} sec`;
        this.selectors.boardContainer.classList.remove('flipped');
        this.selectors.start.classList.remove('disabled');
    }

    flipBackCards() {
        document.querySelectorAll('.card:not(.matched)').forEach((card) => {
            card.classList.remove('flipped');
        });
        this.state.flippedCards = 0;
    }

    flipCard(card) {
        this.state.flippedCards++;
        this.state.totalFlips++;

        if (!this.state.gameStarted) {
            this.startGame();
        }

        if (this.state.flippedCards <= 2) {
            card.classList.add('flipped');
        }

        if (this.state.flippedCards === 2) {
            const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

            if (flippedCards[0].innerText === flippedCards[1].innerText) {
                flippedCards[0].classList.add('matched');
                flippedCards[1].classList.add('matched');
            }

            setTimeout(() => {
                this.flipBackCards();
            }, 1000);

        }

        //If there are no more cards that we can flip, we won the game
        if (!document.querySelectorAll('.card:not(.flipped)').length) {
            setTimeout(() => {
                this.selectors.boardContainer.classList.add('flipped');
                clearInterval(this.state.loop);
                alert('You win!');
                this.resetGame();
            }, 1000);
        }
    }

    addMouseEnterLeaveListeners() {
        this.selectors.boardContainer.addEventListener('mouseenter', () => {
            if (!this.state.gameStarted) {
                this.startGame();
            }
        });
        
        this.selectors.boardContainer.addEventListener('mouseleave', () => {
            if (this.state.gameStarted) {
                clearInterval(this.state.loop);
                this.state.gameStarted = false;
            }
        });
    }

    attachEventListeners() {
        this.selectors.start.addEventListener('click', () => {
            if (!this.state.gameStarted) {
                this.startGame();
            }
        });

        this.selectors.reset.addEventListener('click', () => {
            this.resetGame();
        });

        this.selectors.boardContainer.addEventListener('click', (event) => {
            const eventTarget = event.target;
            const eventParent = eventTarget.parentElement;

            if (
                eventTarget.className.includes('card') &&
                !eventParent.className.includes('flipped')
            ) {
                this.flipCard(eventParent);
            }
        });
        
    }
}

new MatchGrid(4, 4, 4, 4, 60, 'default_theme');

