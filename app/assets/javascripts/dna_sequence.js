App.dnaSequence = App.dnaSequence || {};
let cardCounter = 1;
let sequenceSearchDetails = {};
let sequenceSummaryMatches = {};
const next = 'next';
const previous = 'previous';

/**
 * Sets up all the event handlers required for the sequence data-card add/delete, search and save.
 */
App.dnaSequence.init = function() {
  $(document).on('click', '#add-card', App.dnaSequence.addCard);
  $(document).on('click', '#close-card', App.dnaSequence.deleteCard);
  $(document).on('click', '#generate-sequence', App.dnaSequence.generateSequence);
  $(document).on('click', '#next-sequence', App.dnaSequence.findNextSequence);
  $(document).on('click', '#previous-sequence', App.dnaSequence.findPreviousSequence);
  $(document).on('input', '.card-search', App.dnaSequence.sequenceSearchChange);
  $(document).on('input', '.card-sequence', App.dnaSequence.sequenceChange);
  $(document).on('click', '#summary', App.dnaSequence.handleSequenceDetails);
  $(document).on('click', '#save-sequence', App.dnaSequence.handleSequenceDetails);
};

/**
 * Makes an Ajax call to the rails controller layer to retrieve the view for adding a new sequence data-card
 *
 * @param event - The event which triggered a new card to be added
 *
 * @returns undefined
 */
App.dnaSequence.addCard = function(event) {
  event.preventDefault();

  $.ajax({
    url: this.href,
    data: {cardNumber: cardCounter},
    success: function(cardData) {
      $('#dna-sequence-card').append(cardData);
      sequenceSummaryMatches[cardCounter] = {matches: {}, search: {}, sequence: false, sequence_value: ''};
      cardCounter++;
    }
  });

  // After a card has been added, we want to make sure that save, summary, and message details options.
  $('#summary').show();
  $('#save-sequence').show();
  $('#message').hide();
};

/**
 * Removes the sequence data-card for the action has been called
 *
 * @param event - The event which triggered a the particular card to be removed
 *
 * @returns undefined
 */
App.dnaSequence.deleteCard = function(event) {
  event.preventDefault();

  delete sequenceSummaryMatches[event.currentTarget.attributes.card_id.value];
  $(`#card-${event.currentTarget.attributes.card_id.value}`).remove();

  let cardsDisplayed = $("#dna-sequence-card").find(".card-body");

  // If there are no cards displayed on the view i.e all cards have been removed, we would not want to display
  // the save, summary, and message details options.
  if (cardsDisplayed.length === 0) {
    $('#summary').hide();
    $('#summary-details').hide();
    $('#save-sequence').hide();
  }

  $('#message').hide();
};

/**
 * Handles the updates to be made on every change of the input sequence
 *
 * @param event - The event which was triggered due to the change in a sequence
 *
 * @returns undefined
 */
App.dnaSequence.sequenceChange = function(event) {
  let sequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();

  if (sequence.length === 0) {
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = false;
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].matches = {};
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = '';

    // If there is a change in the sequence, and a search query already exists, we would want to update the match details
    App.dnaSequence.sequenceSearchChange(event);
  } else {
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = true;
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = sequence;

    // If there is a change in the sequence, and a search query already exists, we would want to update the match details
    App.dnaSequence.sequenceSearchChange(event);
  }
};

/**
 * Generates a random sequence of the characters C,A,G,T and length 150 characters. This gets appended to the sequence data-card.
 *
 * @param event - The event which was triggered to generate a new sequence
 *
 * @returns undefined
 */
App.dnaSequence.generateSequence = function(event) {
  const allowedSequence = 'CAGT';
  const generatedSequence = Array.from({length:150}, _ => allowedSequence[Math.floor(Math.random()*allowedSequence.length)]).join('');

  $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val(generatedSequence);
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = true;
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = generatedSequence;

  App.dnaSequence.sequenceSearchChange(event);
};

/**
 * Searches the input sequence for occurrences of the input search query.
 *
 * @param event - The event which was triggered due to the addition/update of a search query
 *
 * @returns undefined
 */
App.dnaSequence.sequenceSearchChange = function(event) {
  const inputSequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();
  const searchSequence = $(`#sequence-search-${event.currentTarget.attributes.card_id.value}`).val();
  let foo = inputSequence;
  let match, matches = [];

  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].matches = matches;
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].search = searchSequence;

  if (searchSequence === "") {
    $(`#sequence-match-${event.currentTarget.attributes.card_id.value}`).text('');
    $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text('');
    return;
  }

  let regexp = RegExp(searchSequence, 'g');

  while ((match = regexp.exec(foo)) != null) {
    matches.push(match.index + 1);
  }


  if (matches.length > 0) {
    let numberMatched = 'Found ' + matches.length + ' times';
    let indexDetail = '#' + '1' + ' at position ' + matches[0];

    $(`#sequence-match-${event.currentTarget.attributes.card_id.value}`).text(numberMatched);
    $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text(indexDetail);
  } else {
    $(`#sequence-match-${event.currentTarget.attributes.card_id.value}`).text('');
    $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text('');
  }

  if(sequenceSearchDetails[event.currentTarget.attributes.card_id.value]) {
    delete sequenceSearchDetails[event.currentTarget.attributes.card_id.value];
  }
};

/**
 * Searches the input sequence for occurrences of the "next" input search query.
 *
 * @param event - The event which was triggered to find the next search query
 *
 * @returns undefined
 */
App.dnaSequence.findNextSequence = function(event) {
  event.preventDefault();
  App.dnaSequence.updateSequence(event, next);
};

/**
 * Searches the input sequence for occurrences of the "previous" input search query.
 *
 * @param event - The event which was triggered to find the previous search query
 *
 * @returns undefined
 */
App.dnaSequence.findPreviousSequence = function(event) {
  event.preventDefault();
  App.dnaSequence.updateSequence(event, previous);
};

/**
 * Searches the input sequence for occurrences of a search query.
 *
 * @param event - The event which was triggered to update the search for the search query
 * @param changeType - This param expects two possible values: next, previous
 *
 * @returns undefined
 */
App.dnaSequence.updateSequence = function(event, changeType) {
  const inputSequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();
  const searchSequence = $(`#sequence-search-${event.currentTarget.attributes.card_id.value}`).val();

  if (searchSequence === "") return;


  let regexp = RegExp(searchSequence, 'g');
  let foo = inputSequence;
  let match, matches = [];
  let indexDetail;

  while ((match = regexp.exec(foo)) != null) {
    matches.push(match.index + 1);
  }

  if (changeType === next) {
    App.dnaSequence.incrementHandler(event, matches);
    indexDetail = App.dnaSequence.buildIndexMessage(event, next)
  } else {
    App.dnaSequence.decrementHandler(event, matches);
    indexDetail = App.dnaSequence.buildIndexMessage(event, previous)
  }

  $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text(indexDetail);
};


/**
 * Builds the message text which describes the index at which a search query was found
 *
 * @param event - The event which was triggered to build the message
 * @param changeType - This param expects two possible values: next, previous
 *
 * @returns a String
 */
App.dnaSequence.buildIndexMessage = function(event, changeType) {
  let index;
  let indexValue = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].indexValue;

  if (changeType === next) {
    if (sequenceSearchDetails[event.currentTarget.attributes.card_id.value].endOfSequence) {
      index = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].index + 1;
    } else {
      index = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].index + 1;
    }

    return '#' + `${index}` + ' at position ' + `${indexValue}`;
  } else {
    index = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].index + 1;

    return '#' + `${index}` + ' at position ' + `${indexValue}`;
  }
};

/**
 * Handles the logic around the counters for every trigger for a "next" search of a search query
 *
 * @param event - The event which was triggered find the next occurrence of a search query
 * @param macthes - This param expects two possible values: next, previous
 *
 * @returns undefined
 */
App.dnaSequence.incrementHandler = function(event, matches) {
  if(sequenceSearchDetails[event.currentTarget.attributes.card_id.value]) {
    let currentIndex = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].index;
    let indexIncrement = currentIndex + 1;

    if (indexIncrement+1 === matches.length) {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexIncrement], index: indexIncrement, endOfSequence: true };
    } else if(indexIncrement+1 > matches.length) {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[currentIndex], index: currentIndex, endOfSequence: true };
    } else {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexIncrement], index: indexIncrement, endOfSequence: false };
    }
  } else {
    if (matches.length === 1) {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[0], index: 0, endOfSequence: true };
    } else {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[1], index: 1, endOfSequence: false };
    }
  }
};

/**
 * Handles the logic around the counters for every trigger for a "previous" search of a search query
 *
 * @param event - The event which was triggered find the previous occurrence of a search query
 * @param macthes - This param expects two possible values: next, previous
 *
 * @returns undefined
 */
App.dnaSequence.decrementHandler = function(event, matches) {
  if(sequenceSearchDetails[event.currentTarget.attributes.card_id.value]) {
    let currentIndex = sequenceSearchDetails[event.currentTarget.attributes.card_id.value].index;
    let indexDecrement = currentIndex - 1;

    if (indexDecrement === 0) {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexDecrement], index: indexDecrement, endOfSequence: true };
    } else if(indexDecrement < 0) {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[currentIndex], index: currentIndex, endOfSequence: true };
    } else {
      sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexDecrement], index: indexDecrement, endOfSequence: false };
    }
  } else {
    sequenceSearchDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[0], index: 0, endOfSequence: true };
  }
};

/**
 * Builds a JSON hash which has all the details for the number of searches, total searches found and the details of each search.
 * This function is used to handle both the "save" and "summary" functionality
 *
 * @param event - The event which was triggered to either "save" or display the "summary" of the sequences
 *
 * @returns undefined
 */
App.dnaSequence.handleSequenceDetails = function(event) {
  event.preventDefault();

  let searches = 0;
  $("[id^=sequence-search-]").each(function() {
    let id = $(this)[0].attributes.card_id.value;

    if($(this)[0].value != '' && $(`#card-sequence-${id}`).val() != '') {
      searches++;
    }
  });

  let summaryDetails = {
    totalSearches: searches,
    sequenceSummaryMatches: sequenceSummaryMatches
  };

  $.ajax({
    url: this.href,
    data: {summaryDetails: summaryDetails},
    format: 'json',
    success: function(cardData) {
      if (cardData.save) {
        location.reload(true);
      } else {
        $('#message').hide();
        $('#summary-details').replaceWith(cardData);
      }
    },
    error: function (event) {
      if (event.status === 500) {
        $('#message').text("Your data could not be saved");
        $('#message').show();
      }
    }
  });
};

$(document).ready(function() {
  App.dnaSequence.init();
});
