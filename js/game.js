document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    let userName = sessionStorage.getItem('namePlayer') || 'Unknown Player';
    const quizContainer = document.getElementById('quiz-container');
    const nav = document.getElementById('nav');
    
    // Update navigation with user info
    nav.innerHTML = `
    <nav class="navbar" id="navigation">
    <div id="userName">Xush kelibsiz, ${userName}</div>
    <div id="timer">Qolgan Vaqt: 15 daqiqa</div>
    <div id="score">Natija: 0</div>
    </nav>`;
    
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    // Game state
    let currentScore = 0;
    let totalRounds = 0;
    let questions = [];
    let interval;

    // Settings from localStorage
    const numQuestions = parseInt(localStorage.getItem('numQuestions')) || 10;
    const difficulty = localStorage.getItem('difficulty') || 'easy';

    function startQuiz() {
        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                prepareQuestions(response.data);
                displayQuestion();
            })
            .catch(error => {
                console.error('Error:', error);
                quizContainer.innerHTML = 'Malumot yuklanmadi. Iltimos, qayta urinib ko\'ring.';
            });
    }

    function prepareQuestions(countries) {
        const availableCountries = [...countries];

        while (questions.length < numQuestions && availableCountries.length >= 4) {
            const randomIndex = Math.floor(Math.random() * availableCountries.length);
            const country = availableCountries.splice(randomIndex, 1)[0];

            if (!country.capital || country.capital.length === 0) continue;

            const correctAnswer = country.capital[0];
            const options = new Set([correctAnswer]);

            while (options.size < 4) {
                const randomCountry = countries[Math.floor(Math.random() * countries.length)];
                if (randomCountry.capital && randomCountry.capital.length > 0) {
                    options.add(randomCountry.capital[0]);
                }
            }

            questions.push({
                country: country.name.common,
                flag: country.flags.svg,
                options: [...options].sort(() => Math.random() - 0.5),
                correctAnswer: correctAnswer
            });
        }
    }

    function displayQuestion() {
        if (totalRounds >= questions.length) {
            endGame();
            return;
        }

        const question = questions[totalRounds];
        quizContainer.innerHTML = `
            <div class="question-container">
                <img src="${question.flag}" alt="${question.country} flag" class="flag-image">
                <h2>What is the capital of ${question.country}?</h2>
                <div class="options">
                    ${question.options.map((option) =>
                        `<button class="option" onclick="window.selectAnswer('${option}', '${question.correctAnswer}')">${option}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        startTimer();
        updateScore();
    }

    window.selectAnswer = function(selected, correct) {
        clearInterval(interval);
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.disabled = true;
            if (option.textContent === correct) {
                option.classList.add('correct');
            }
            if (option.textContent === selected && selected !== correct) {
                option.classList.add('wrong');
            }
        });

        if (selected === correct) {
            currentScore++;
            updateScore();
        }

        setTimeout(() => {
            totalRounds++;
            displayQuestion();
        }, 2000);
    };

    function startTimer() {
        let time = 15;
        timerElement.textContent = `Qolgan Vaqt: ${time} daqiqa`;

        clearInterval(interval);
        interval = setInterval(() => {
            time--;
            timerElement.textContent = `Qolgan Vaqt: ${time} daqiqa`;

            if (time <= 0) {
                clearInterval(interval);
                window.selectAnswer('timeout', questions[totalRounds].correctAnswer);
            }
        }, 1000);
    }

    function updateScore() {
        scoreElement.textContent = `Natija: ${currentScore}`;
    }

    function endGame() {
        clearInterval(interval);

        // Save score to localStorage
        const highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
        if (!highScores[userName] || highScores[userName] < currentScore) {
            highScores[userName] = currentScore;
            localStorage.setItem('highScores', JSON.stringify(highScores));
        }

        // Display end game message
        const percentageScore = (currentScore / questions.length) * 100;
        let message = '';
        if (percentageScore === 100) message = "Siz dahosiz! 😎";
        else if (percentageScore >= 80) message = "Yaxshi natija! 😇";
        else if (percentageScore >= 60) message = "Barakalla! 😊";
        else if (percentageScore >= 40) message = "Yomon emas 😌";
        else message = "Keyingi safar uchun yaxshilab tayyorlaning! 😔";

        quizContainer.innerHTML = `
            <div class="end-game">
                <h2>Yutqazdingiz! 🥱</h2>
                <p>Sizning natijangiz: ${currentScore} / ${questions.length}</p>
                <p>${message}</p>
                <button onclick="location.reload()">Qayta o'ynash</button>
                <button onclick="window.showLeaderboard()">Natijalar ro'yxati</button>
            </div>
        `;
    }

    window.showLeaderboard = function() {
        const highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
        const scores = Object.entries(highScores)
            .sort(([,a], [,b]) => b - a)
            .map(([name, score], index) =>
                `<tr>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${score}</td>
                </tr>`
            ).join('');

       quizContainer.innerHTML = `
    <div class="leaderboard">
        <h2>Leaderboard</h2>
        <table>
            <thead>
                <tr>
                    <th>O'rin</th>
                    <th>Ism</th>
                    <th>Natija</th>
                </tr>
            </thead>
            <tbody>
                ${scores}
            </tbody>
        </table>
        <button onclick="location.reload()">Qayta o'ynash</button>
    </div>
`};

    // Start the quiz when page loads
    startQuiz();
});
