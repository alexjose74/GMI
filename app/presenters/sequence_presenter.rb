class SequencePresenter

  attr_reader :sequence_id, :sequence_details

  # Public: Initializes the SequencePresenter class
  #
  # sequence: A single sequence
  #
  # Returns an object of SequencePresenter
  def initialize(sequence)
    @sequence_id = sequence[:id]
    @sequence_details = sequence[:sequence_details]
  end

  # Public: Checks for the search matches which were identified for a particular sequence and search query.
  #
  # Returns an array of search matches, if present. Returns an empty array otherwise.
  def matches
    sequence_details[:matches] || []
  end

  # Public: Checks for the total number of search matches for a a particular sequence and search query.
  #
  # Returns an Integer which represents the number of search matches.
  def total_matches
    matches.count
  end

  # Public: Checks for the search query for a particular sequence
  #
  # Returns a String which represents the search query, if present. Returns an empty string otherwise.
  def search_query
    sequence_details[:search]
  end

  # Public: Checks whether a sequence was entered in the card. It can always be the case that the user
  #         entered just the search query and no sequence to be searched on.
  #
  # Returns a Boolean value, true if the sequence was entered, false otherwise.
  def sequence_input_present?
    sequence_details[:sequence] == 'true'
  end

  # Public: Checks for the sequence input value
  #
  # Returns a string representing the sequence, if present. An empty string otherwise.
  def sequence_input
    sequence_details[:sequence_value] || ''
  end

  # Public: Builds the text which would be the title for each summary element.
  #
  # Returns an I18n'd text.
  def display_sequence_title
    I18n.t('sequence_identifier.summary.sequence.title', index: sequence_id)
  end

  # Public: Builds the text which would be used to display the search results.
  #
  # Returns an I18n'd text.
  def display_search_text
    if search_query.present?
      I18n.t('sequence_identifier.summary.sequence.search_result', count: total_matches, search_query: search_query, matches_count: total_matches)
    else
      I18n.t('sequence_identifier.summary.sequence.no_search_result')
    end
  end

  # Builds the text which would be used to display the position of the search query match
  #
  # match - The index at which the match was found
  # counter - The count of the n-th match
  #
  # Returns an I18n'd text.
  def display_matches_text(match, counter)
    I18n.t('sequence_identifier.summary.sequence.match', index: counter+1, match_value: match)
  end
end