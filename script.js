const wordEl = document.getElementById('word');
const wrongLettersEl = document.getElementById('wrong-letters');
const playAgainBtn = document.getElementById('play-button');
const popup = document.getElementById('popup-container');
const notification = document.getElementById('notification-container');
const finalMessage = document.getElementById('final-message');
const finalMessageRevealWord = document.getElementById('final-message-reveal-word');
const definitionListEl = document.getElementById('definition-list');
const figureParts = document.querySelectorAll('.figure-part');

let selectedWord = '';
let playable = true;

const correctLetters = [];
const wrongLetters = [];

// API call to get word
const setWord = async () => {
  const wordResponse = await fetch(`https://puzzle.mead.io/puzzle?wordCount=1`);

  if (wordResponse.status === 200) {
    const data = await wordResponse.json();
    selectedWord = data.puzzle.toLowerCase();
  }
};

// API call to set Definition the game
const setDefinition = async () => {
  const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${selectedWord}`);

  if (definitionResponse.status === 200) {
    const definitionData = await definitionResponse.json();
    definitionData[0].meanings.forEach(meaning => {
      const definition = meaning.definitions[0].definition;
      const liEl = document.createElement("LI"); // Make sure word is not hidden in the definition.

      if (!definition.includes(selectedWord)) {
        definitionListEl.appendChild(liEl).innerHTML = definition;
      }
    });
  } else {
		setupGame();
	}
};

// Setup the game
const setupGame = async () => {
	wordEl.innerHTML = "Loading Puzzle..."
	definitionListEl.innerHTML = '';

  await setWord();
  await setDefinition();

  displayWord();
};

// Display the word on screen
const displayWord = () => {
  wordEl.innerHTML = `
    ${selectedWord.split('').map(letter => `
          <span class="letter">
            ${correctLetters.includes(letter) ? letter : ''}
          </span>
        `).join('')}
  `;
  const innerWord = wordEl.innerText.replace(/[ \n]/g, '');

  if (innerWord === selectedWord) {
    finalMessage.innerText = 'Congratulations! You won! 😃';
    finalMessageRevealWord.innerText = '';
    popup.style.display = 'flex';
    playable = false;
  }
};

// Update the wrong letters
const updateWrongLettersEl = () => {
  // Display wrong letters
  wrongLettersEl.innerHTML = `
    ${wrongLetters.length > 0 ? '<p>Wrong</p>' : ''}
    ${wrongLetters.map(letter => `<span>${letter}</span>`)}
  `;
  
  // Display parts
  figureParts.forEach((part, index) => {
    const errors = wrongLetters.length;

    if (index < errors) {
      part.style.display = 'block';
    } else {
      part.style.display = 'none';
    }
  }); // Check if lost

  if (wrongLetters.length === figureParts.length) {
    finalMessage.innerText = 'Unfortunately you lost. 😕';
    finalMessageRevealWord.innerText = `...the word was: ${selectedWord}`;
    popup.style.display = 'flex';
    playable = false;
  }
};

// Show notification
const showNotification = () => {
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
};

// Keydown letter press
window.addEventListener('keydown', e => {
  if (playable) {
    if (!(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) {
      if (e.keyCode >= 65 && e.keyCode <= 90) {
        const letter = e.key.toLowerCase();

        if (selectedWord.includes(letter)) {
          if (!correctLetters.includes(letter)) {
            correctLetters.push(letter);
            displayWord();
          } else {
            showNotification();
          }
        } else {
          if (!wrongLetters.includes(letter)) {
            wrongLetters.push(letter);
            updateWrongLettersEl();
          } else {
            showNotification();
          }
        }
      }
    }
  }
});

// Restart game and play again
playAgainBtn.addEventListener('click', () => {
  playable = true; //  Empty arrays

  correctLetters.splice(0);
  wrongLetters.splice(0);

  setupGame();
  updateWrongLettersEl();

  popup.style.display = 'none';
});

setupGame();
