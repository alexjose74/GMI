App.dnaSequence = App.dnaSequence || {};
let cardCounter = 1;
let sequenceSearchDetails = {};
let sequenceSummaryMatches = {};
const next = 'next';
const previous = 'previous';

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

  $('#summary').show();
  $('#save-sequence').show();
  $('#message').hide();
};

App.dnaSequence.deleteCard = function(event) {
  event.preventDefault();

  delete sequenceSummaryMatches[event.currentTarget.attributes.card_id.value];
  $(`#card-${event.currentTarget.attributes.card_id.value}`).remove();

  let cardsDisplayed = $("#dna-sequence-card").find(".card-body");
  if (cardsDisplayed.length === 0) {
    $('#summary').hide();
    $('#summary-details').hide();
    $('#save-sequence').hide();
  }

  $('#message').hide();
};

App.dnaSequence.sequenceChange = function(event) {
  let sequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();

  if (sequence.length === 0) {
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = false;
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].matches = {};
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = '';
    App.dnaSequence.sequenceSearchChange(event);
  } else {
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = true;
    sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = sequence;
    App.dnaSequence.sequenceSearchChange(event);
  }
};

App.dnaSequence.generateSequence = function(event) {
  const allowedSequence = 'CAGT';
  const generatedSequence = Array.from({length:150}, _ => allowedSequence[Math.floor(Math.random()*allowedSequence.length)]).join('');

  $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val(generatedSequence);
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence = true;
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].sequence_value = generatedSequence;

  App.dnaSequence.sequenceSearchChange(event);
};

App.dnaSequence.sequenceSearchChange = function(event) {
  const inputSequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();
  const searchSequence = $(`#sequence-search-${event.currentTarget.attributes.card_id.value}`).val();
  var foo = inputSequence;
  var match, matches = [];

  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].matches = matches;
  sequenceSummaryMatches[event.currentTarget.attributes.card_id.value].search = searchSequence;

  if (searchSequence === "") {
    $(`#sequence-match-${event.currentTarget.attributes.card_id.value}`).text('');
    $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text('');
    return;
  }

  var regexp = RegExp(searchSequence, 'g');

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

App.dnaSequence.findNextSequence = function(event) {
  event.preventDefault();
  App.dnaSequence.updateSequence(event, next);
};

App.dnaSequence.findPreviousSequence = function(event) {
  event.preventDefault();
  App.dnaSequence.updateSequence(event, previous);
};

App.dnaSequence.updateSequence = function(event, changeType) {
  const inputSequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();
  const searchSequence = $(`#sequence-search-${event.currentTarget.attributes.card_id.value}`).val();

  if (searchSequence === "") return;


  var regexp = RegExp(searchSequence, 'g');
  var foo = inputSequence;
  var match, matches = [];
  var indexDetail;

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
