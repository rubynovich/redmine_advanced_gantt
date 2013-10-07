class AdvancedGanttProjectController < ApplicationController
  unloadable
  menu_item :advanced_gantt
  before_filter :find_optional_project

  rescue_from Query::StatementInvalid, :with => :query_statement_invalid

  helper :gantt
  helper :issues
  helper :projects
  helper :queries
  include QueriesHelper
  helper :sort
  include SortHelper
  include Redmine::Export::PDF

  def index
    #raise @project.inspect
    @gantt = Redmine::Helpers::Gantt.new(params)
    @gantt.project = @project

    retrieve_query
    @query.group_by = nil
    @gantt.query = @query if @query.valid?
    basename = (@project ? "#{@project.identifier}-" : '') + 'gantt'
    data = []
    @data_gantt ||= []
    Project.project_tree(projects) do |project, level|
      render_project(project, {:level => level})
      break if abort?
    end
    #@gantt.render
    gon.rabl "#{Rails.root}/plugins/redmine_advanced_gantt/app/views/advanced_gantt_project/index.json.rabl"
    respond_to do |format|
      format.html {
        render :layout => !request.xhr?
      }
      #format.png  { send_data(@gantt.to_image, :disposition => 'inline', :type => 'image/png', :filename => "#{basename}.png") } if @gantt.respond_to?('to_image')
      #format.pdf  { send_data(@gantt.to_pdf, :type => 'application/pdf', :filename => "#{basename}.pdf") }
    end
  end

  private

  def render_project(project, options={})
    item = {
        id: "p#{project.id}",
        text: "<a href=\"/projects/#{project.identifier}\" target=\"_new\">#{project.name}</a>".html_safe,
        project:1,
        open: options[:level] == 1 ? 1 : 0
    }
    item[:parent] = "p#{project.parent.id}" if project.parent.present?



    #subject_for_project(project, options) unless options[:only] == :lines
    #line_for_project(project, options) unless options[:only] == :subjects
    #options[:top] += options[:top_increment]
    #options[:indent] += options[:indent_increment]
    #@number_of_rows += 1
    #return if abort?
    issues = project_issues(project).select {|i| i.fixed_version.nil?}
    sort_issues!(issues)
    if issues
      render_issues(issues, options)
      #return if abort?
    end
    versions = project_versions(project)
    versions.each do |version|
      render_version(project, version, options)
    end
    # Remove indent to hit the next sibling
    #options[:indent] -= options[:indent_increment]
  end

  def render_issues(issues, options={})
    @issue_ancestors = []
    issues.each do |i|
      item = {
          id: "p#{i.id}",
          text: %{<img class="gravatar" width="10" height="10" title="Назначена: #{i.assigned_to.name}" src="/plugin_assets/redmine_people/images/person.png?1377243889" alt="Person">
<a class="issue tracker-4 status-4 priority-4 priority-default overdue child" href="/issues/49935">Задача #49935</a>
: Том 3.3.2. Пересечения в разных уровнях. Транспортная развязка на км 9+980 Каширского шоссе}.html_safe,
          project:1,
          parent: i.parent.nil? ? "p#{i.project.id}" : "#{i.id}"
      }

      #subject_for_issue(i, options) unless options[:only] == :lines
      #line_for_issue(i, options) unless options[:only] == :subjects
      #options[:top] += options[:top_increment]
      #@number_of_rows += 1
      #break if abort?
    end
    #options[:indent] -= (options[:indent_increment] * @issue_ancestors.size)
  end

  def render_version(project, version, options={})
    # Version header
    subject_for_version(version, options) unless options[:only] == :lines
    line_for_version(version, options) unless options[:only] == :subjects
    options[:top] += options[:top_increment]
    @number_of_rows += 1
    return if abort?
    issues = version_issues(project, version)
    if issues
      sort_issues!(issues)
      # Indent issues
      options[:indent] += options[:indent_increment]
      render_issues(issues, options)
      options[:indent] -= options[:indent_increment]
    end
  end

end
