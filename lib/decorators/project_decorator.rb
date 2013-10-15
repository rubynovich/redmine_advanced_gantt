class ProjectDecorator < Draper::Decorator
  include AdvancedGanttProject::Concerns::Decorators

  def start_date
    if minimal_date = Setting[:plugin_redmine_advanced_gantt][:minimal_date]
      object.issues.where(["start_date <= ?", minimal_date]).minimum(:start_date)
    else
      object.start_date
    end
  end

  def due_date
    if minimal_date = Setting[:plugin_redmine_advanced_gantt][:minimal_date]
      object.issues.where(["due_date <= ?", minimal_date]).maximum(:due_date)
    else
      object.start_date
    end
  end

end