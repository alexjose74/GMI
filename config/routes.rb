Rails.application.routes.draw do
  root to: 'home#index'

  get '/add_dna_sequence', to: 'home#add_dna_sequence'
  get '/add_summary_details', to: 'home#add_summary_details'
end
