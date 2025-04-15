/**
 * Format date to a readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Calculate reading progress percentage
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   * @returns {number} - Percentage of reading progress
   */
  const calculateProgress = (currentPage, totalPages) => {
    if (!currentPage || !totalPages || totalPages === 0) {
      return 0;
    }
    return Math.floor((currentPage / totalPages) * 100);
  };
  
  /**
   * Group words alphabetically
   * @param {Array} words - Array of word objects
   * @returns {Object} - Words grouped by first letter
   */
  const groupWordsAlphabetically = (words) => {
    const groupedWords = {};
    
    words.forEach(word => {
      const firstLetter = word.word.charAt(0).toUpperCase();
      if (!groupedWords[firstLetter]) {
        groupedWords[firstLetter] = [];
      }
      groupedWords[firstLetter].push(word);
    });
    
    return groupedWords;
  };
  
  module.exports = {
    formatDate,
    calculateProgress,
    groupWordsAlphabetically
  };