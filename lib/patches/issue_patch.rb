module IssuePatch
  extend ActiveSupport::Concern
  included do
    scope :overdue, lambda { where(["(#{Issue.table_name}.due_date < ?) and (#{Issue.table_name}.status_id IN (?))", Date.today, IssueStatus.opened_status_ids]) }
    def is_overdue
      (self.due_date < Date.today) && IssueStatus.opened_status_ids.include?(self.status_id)
    end
  end

end