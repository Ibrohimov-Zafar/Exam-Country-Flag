function toggleSettings() {
   const namePlayer = document.getElementById('namePlayer').value.trim();
   const settingsContainer = document.getElementById('settingsContainer');

   if (namePlayer) {
       sessionStorage.setItem('namePlayer', namePlayer);
       settingsContainer.classList.remove('hidden');
   } else {
       alert('Please enter your name');
   }
}

function saveSettings() {
   const numQuestions = document.getElementById('numQuestions').value;
   const difficulty = document.getElementById('difficulty').value;
   localStorage.setItem('numQuestions', numQuestions);
   localStorage.setItem('difficulty', difficulty);
   window.location.href = 'game.html';  
}
