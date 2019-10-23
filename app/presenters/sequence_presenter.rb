class SequencePresenter

  attr_reader :sequence_id, :sequence_details

  def initialize(sequence)
    @sequence_id = sequence[:id]
    @sequence_details = sequence[:sequence_details]
  end

  def matches
    sequence_details[:matches] || []
  end

  def total_matches
    matches.count
  end

  def search_query
    sequence_details[:search]
  end

  def sequence_input_present?
    sequence_details[:sequence] == 'true'
  end

  def display_sequence_title
    I18n.t('sequence_identifier.summary.sequence.title', index: sequence_id)
  end

  def display_search_text
    if search_query.present?
      I18n.t('sequence_identifier.summary.sequence.search_result', count: total_matches, search_query: search_query, matches_count: total_matches)
    else
      I18n.t('sequence_identifier.summary.sequence.no_search_result')
    end
  end

  def display_matches_text(match, counter)
    I18n.t('sequence_identifier.summary.sequence.match', index: counter+1, match_value: match)
  end
end