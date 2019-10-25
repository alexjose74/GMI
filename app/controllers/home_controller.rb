class HomeController < ApplicationController

  # Public: The root route for the web application.
  #
  # Returns nil.
  def index
  end

  # Public: Sets up the view for adding a new DNA sequence card. This function is intended to be hit from an Ajax call.
  #         It does not render a base layout.
  #
  # Renders a partial which contains just the new sequence card.
  def add_dna_sequence
    render partial: 'dna_sequence', locals: {card_count: params[:cardNumber]}, layout: false
  end

  # Public: Sets up the view for displaying the summary details for the DNA sequences. This function is intended
  #         to be hit from an Ajax call. It does not render a base layout.
  #
  # Renders a partial which has all the summary details of the DNA sequence being searched.
  def add_summary_details
    summary_params = params[:summaryDetails]
    summary_details = []

    if summary_params[:sequenceSummaryMatches]
      summary_params[:sequenceSummaryMatches].each do |key, value|
        summary_details << ::SequencePresenter.new({id: key, sequence_details: value})
      end
    end

    summary = {
      total_searches: summary_params[:totalSearches] == '0' ? 0 : summary_params[:totalSearches],
      total_search_results: total_search_results(summary_details),
      sequence_details: summary_details
    }

    render partial: 'summary_details', locals: {summary: summary}, layout: false
  end

  # Public: Saves the sequence details into a public API. This is done via a REST call.
  #
  # Returns a status code for the save attempt.
  def save_sequence_details
    summary_params = params[:summaryDetails]
    summary_details = []
    post_body = []

    if summary_params[:sequenceSummaryMatches]
      summary_params[:sequenceSummaryMatches].each do |key, value|
        summary_details << ::SequencePresenter.new({id: key, sequence_details: value})
      end
    end

    summary_details.each do |sequence_summary|
      post_body << build_api_body(sequence_summary) if sequence_summary.sequence_details[:sequence] != 'false' && \
        sequence_summary.sequence_details[:sequence_value].present?
    end

    render(json: {no_data: true}, status: :bad_request) if post_body.empty?

    summary = {
      sequences: post_body
    }

    save_sequence_details = HTTParty.post("http://localhost:3001/sequences", body: summary)

    if save_sequence_details.code == 204
      render(json: {save: true}, status: :ok)
    else
      render(json: {save: true}, status: :internal_server_error)
    end
  end

  private

  # Internal: Build a hash details for each sequence passed into the function.
  #
  # sequence - A SequencePresenter object
  #
  # Returns a hash which has all the necessary values of the sequence to be saved.
  def build_api_body(sequence)
    {
      sequence: sequence.sequence_input,
      search: sequence.search_query,
      matches: sequence.matches
    }
  end

  # Internal: Calculates the count of the number of search results across all sequences.
  #
  # summary_details: An array of all the sequences
  #
  # Returns an Integer, which is the total number of search results across all sequences.
  def total_search_results(summary_details)
    total_count = 0

    summary_details.map do |sequence|
      total_count += sequence.matches.count
    end

    total_count
  end
end
