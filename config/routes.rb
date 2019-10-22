Rails.application.routes.draw do
  root to: 'home#index'

  get '/add_dna_sequence', to: 'home#add_dna_sequence'
end
