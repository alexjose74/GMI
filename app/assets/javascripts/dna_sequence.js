App.dnaSequence = App.dnaSequence || {};
let cardCounter = 1;
let nextSequenceDetails = {};
let previousSequenceDetails = {};
const next = 'next';
const previous = 'previous';

App.dnaSequence.init = function() {
  $(document).on('click', '#add-card', App.dnaSequence.addCard);
  $(document).on('click', '#close-card', App.dnaSequence.deleteCard);
  $(document).on('click', '#generate-sequence', App.dnaSequence.generateSequence);
  $(document).on('click', '#next-sequence', App.dnaSequence.findNextSequence);
  $(document).on('click', '#previous-sequence', App.dnaSequence.findPreviousSequence);
  $(document).on('input', '.card-search', App.dnaSequence.SequenceChange);
};

App.dnaSequence.addCard = function(event) {
  event.preventDefault();

  $.ajax({
    url: this.href,
    data: {cardNumber: cardCounter},
    success: function(cardData) {
      $('#dna-sequence-card').append(cardData);
      cardCounter++;
    }
  });
};

App.dnaSequence.deleteCard = function(event) {
  event.preventDefault();

  $(`#card-${event.currentTarget.attributes.card_id.value}`).remove();
};

App.dnaSequence.generateSequence = function(event) {
  const allowedSequence = 'CAGT';
  const generatedSequence = Array.from({length:150}, _ => allowedSequence[Math.floor(Math.random()*allowedSequence.length)]).join('');

  $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val(generatedSequence);
};

App.dnaSequence.SequenceChange = function(event) {
  const inputSequence = $(`#card-sequence-${event.currentTarget.attributes.card_id.value}`).val();
  const searchSequence = $(`#sequence-search-${event.currentTarget.attributes.card_id.value}`).val();

  if (searchSequence === "") {
    $(`#sequence-match-${event.currentTarget.attributes.card_id.value}`).text('');
    $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text('');
    return;
  }

  var regexp = RegExp(searchSequence, 'g');
  var foo = inputSequence;
  var match, matches = [];

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

  if(nextSequenceDetails[event.currentTarget.attributes.card_id.value]) {
    delete nextSequenceDetails[event.currentTarget.attributes.card_id.value];
    delete previousSequenceDetails[event.currentTarget.attributes.card_id.value];
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
    indexDetail = App.dnaSequence.buildIndexMessage(event, next, matches)
  } else {
    App.dnaSequence.decrementHandler(event, matches);
    indexDetail = App.dnaSequence.buildIndexMessage(event, previous, matches)
  }

  $(`#sequence-index-${event.currentTarget.attributes.card_id.value}`).text(indexDetail);
};


App.dnaSequence.buildIndexMessage = function(event, changeType, matches) {
  let index;
  let indexValue = nextSequenceDetails[event.currentTarget.attributes.card_id.value].indexValue;

  if (changeType === next) {
    if (nextSequenceDetails[event.currentTarget.attributes.card_id.value].endOfSequence) {
      index = nextSequenceDetails[event.currentTarget.attributes.card_id.value].index + 1;
    } else {
      index = nextSequenceDetails[event.currentTarget.attributes.card_id.value].index + 1;
    }

    return '#' + `${index}` + ' at position ' + `${indexValue}`;
  } else {
    index = nextSequenceDetails[event.currentTarget.attributes.card_id.value].index + 1;

    return '#' + `${index}` + ' at position ' + `${indexValue}`;
  }
};

App.dnaSequence.incrementHandler = function(event, matches) {
  if(nextSequenceDetails[event.currentTarget.attributes.card_id.value]) {
    let currentIndex = nextSequenceDetails[event.currentTarget.attributes.card_id.value].index;
    let indexIncrement = currentIndex + 1;

    if (indexIncrement+1 === matches.length) {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexIncrement], index: indexIncrement, endOfSequence: true };
    } else if(indexIncrement+1 > matches.length) {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[currentIndex], index: currentIndex, endOfSequence: true };
    } else {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexIncrement], index: indexIncrement, endOfSequence: false };
    }
  } else {
    if (matches.length === 1) {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[0], index: 0, endOfSequence: true };
    } else {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[1], index: 1, endOfSequence: false };
    }
  }
};

App.dnaSequence.decrementHandler = function(event, matches) {
  if(nextSequenceDetails[event.currentTarget.attributes.card_id.value]) {
    let currentIndex = nextSequenceDetails[event.currentTarget.attributes.card_id.value].index;
    let indexDecrement = currentIndex - 1;

    if (indexDecrement === 0) {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexDecrement], index: indexDecrement, endOfSequence: true };
    } else if(indexDecrement < 0) {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[currentIndex], index: currentIndex, endOfSequence: true };
    } else {
      nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[indexDecrement], index: indexDecrement, endOfSequence: false };
    }
  } else {
    nextSequenceDetails[event.currentTarget.attributes.card_id.value] = { indexValue: matches[0], index: 0, endOfSequence: true };
  }
};

$(document).ready(function() {
  App.dnaSequence.init();
});
