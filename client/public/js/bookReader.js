// Vocabulary Popup Functionality
function createVocabPopup(episodeWords) {
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'vocab-popup';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'vocab-overlay';
    document.body.appendChild(overlay);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'vocab-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Key Words for This Episode';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'vocab-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(popupContainer);
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'vocab-content';
    
    // Create word list
    const wordList = document.createElement('div');
    wordList.className = 'vocab-list';
    
    // Populate words
    Object.entries(episodeWords).forEach(([english, translation]) => {
      const wordItem = document.createElement('div');
      wordItem.className = 'vocab-item';
      
      const englishWord = document.createElement('div');
      englishWord.className = 'vocab-english';
      englishWord.textContent = english;
      
      const translationWord = document.createElement('div');
      translationWord.className = 'vocab-translation';
      translationWord.textContent = translation;
      
      wordItem.appendChild(englishWord);
      wordItem.appendChild(translationWord);
      wordList.appendChild(wordItem);
    });
    
    content.appendChild(wordList);
    
    // Assemble popup
    popupContainer.appendChild(header);
    popupContainer.appendChild(content);
    
    // Append to body
    document.body.appendChild(popupContainer);
    
    return popupContainer;
  }
  
  // Function to fetch vocabulary list and show popup
  async function showVocabPopup(bookFilename, episodeNumber) {
    try {
      // Remove .json extension if present
      const baseFilename = bookFilename.replace('.json', '');
      
      // Fetch the vocabulary list
      const response = await fetch(`/assets/lists/${baseFilename}.json`);
      
      if (!response.ok) {
        console.error('Failed to load vocabulary list:', response.status);
        return;
      }
      
      const data = await response.json();
      const episodeKey = `episode${episodeNumber}`;
      
      // Check if the episode exists in the vocabulary data
      if (data.episodes && data.episodes.some(episode => episode[episodeKey])) {
        const episodeData = data.episodes.find(episode => episode[episodeKey]);
        const wordList = episodeData[episodeKey][0];
        
        // Create and show popup
        createVocabPopup(wordList);
      } else {
        console.warn(`No vocabulary list found for episode ${episodeNumber}`);
      }
    } catch (error) {
      console.error('Error loading vocabulary list:', error);
    }
  }
  
  // Export for use in other files
  window.showVocabPopup = showVocabPopup;