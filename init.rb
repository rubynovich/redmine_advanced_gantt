Redmine::Plugin.register :redmine_advanced_gantt do
  name 'Redmine Advanced Gantt plugin'
  author 'Maksim Koritskiy'
  description 'Redmine plugin for drawing and update data from Gantt diagram'
  version '0.0.1'
  url 'https://bitbucket.org/gorkapstroy/redmine_advanced_gantt'
  author_url 'http://maksim.koritskiy.ru'
  requires_redmine :version_or_higher => '2.0.3'

  project_module :advanced_gantt do
    permission :view_advanced_gantt, :advanced_gantt_project => :index
  end
  menu :project_menu, :advanced_gantt, { :controller => :advanced_gantt_project, :action => :index }, :caption => :advanced_gantt, :after => :new_issue
end
