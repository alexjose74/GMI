module Api
  class DnaSequenceController < ApiController
    skip_before_action :verify_authenticity_token

    def sequence

    end
  end
end
