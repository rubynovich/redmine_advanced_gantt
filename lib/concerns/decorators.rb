module AdvancedGanttProject
  module Concerns
    module Decorators
      extend ActiveSupport::Concern

      included do
        delegate_all
      end

      def duration
        duration = ((object.due_date || Date.today) - (object.start_date || Date.today))
        duration = 1 if duration < 1
        duration.to_i
      end

      def start_at
        (object.start_date || Date.today).strftime("%d-%m-%Y")
      end

      def end_at
        (object.due_date || Date.today).strftime("%d-%m-%Y")
      end

    end
  end
end

