class IssueRelationDecorator < Draper::Decorator
  delegate_all
  def type
    if ["relates", "duplicates", "duplicated"].include?(object.relation_type)
      1
    elsif ["blocked", "blocks"].include?(object.relation_type)
      2
    else
      0
    end
  end

  def back
    ["duplicated", "blocked", "copied_from","follows"].include?(object.relation_type)
  end

end