class HomeController < ApplicationController
  def index

  end

  def add_dna_sequence
    render partial: 'dna_sequence', locals: {card_count: params[:cardNumber]}, layout: false
  end

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

  def build_api_body(sequence)
    {
      sequence: sequence.sequence_input,
      search: sequence.search_query,
      matches: sequence.matches
    }
  end

  def total_search_results(summary_details)
    total_count = 0

    summary_details.map do |sequence|
      total_count += sequence.matches.count
    end

    total_count
  end
end
