class HomeController < ApplicationController
  def index

  end

  def add_dna_sequence
    render partial: 'dna_sequence', locals: {card_count: params[:cardNumber]}, layout: false
  end
end