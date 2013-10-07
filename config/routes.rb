# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
get 'projects/:project_id/gantt', :to => 'advanced_gantt_project#index'
get 'projects/:id/gantt', :to => 'advanced_gantt_project#index'