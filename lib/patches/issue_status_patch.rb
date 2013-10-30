module IssueStatusPatch
  extend ActiveSupport::Concern
  included do
    cattr_reader :opened_status_ids
    def self.opened_status_ids
      if IssueStatus.class_variable_get("@@opened_status_ids").nil?
        IssueStatus.class_variable_set("@@opened_status_ids", IssueStatus.where(:is_closed => false).select(:id).map{|is| is.id})
      end
      IssueStatus.class_variable_get("@@opened_status_ids")
    end

    def self.closed_status_ids
      if IssueStatus.class_variable_get("@@closed_status_ids").nil?
        IssueStatus.class_variable_set("@@closed_status_ids", IssueStatus.where(:is_closed => true).select(:id).map{|is| is.id})
      end
      IssueStatus.class_variable_get("@@closed_status_ids")
    end

  end

end