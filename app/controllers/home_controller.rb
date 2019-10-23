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

  private

  def total_search_results(summary_details)
    total_count = 0

    summary_details.map do |sequence|
      total_count += sequence.matches.count
    end

    total_count
  end
end
