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
  helper ActionView::Helpers::UrlHelper

  def index
    #raise @project.inspect
    @gantt = Redmine::Helpers::Gantt.new(params)
    @gantt.project = @project

    retrieve_query
    @query.group_by = nil
    @gantt.query = @query if @query.valid?
    basename = (@project ? "#{@project.identifier}-" : '') + 'gantt'
    #data = []
    @data_gantt ||= []#{data: [], links: []}
    @links_gantt ||= []
    #raise @gantt.projects.inspect
    Project.project_tree(@gantt.projects) do |project, level|
      add_project(project, {:level => level})
      #break if abort?
    end
    gon.data_gantt = {data: @data_gantt, links: @links_gantt}
    #@gantt.render
    #gon.rabl "#{Rails.root}/plugins/redmine_advanced_gantt/app/views/advanced_gantt_project/index.json.rabl"
    respond_to do |format|
      format.html {
        render :layout => !request.xhr?
      }
      #format.png  { send_data(@gantt.to_image, :disposition => 'inline', :type => 'image/png', :filename => "#{basename}.png") } if @gantt.respond_to?('to_image')
      #format.pdf  { send_data(@gantt.to_pdf, :type => 'application/pdf', :filename => "#{basename}.pdf") }
    end
  end

  private

  def add_project(project, options={})

    item = {
        #id: "p#{project.id}",
        id: project.id,
        text: view_context.link_to_project(project).html_safe,
        project:1,
        open: project.status == '1', #options[:level] == 1 ? 1 : 0,
        progress: project.completed_percent / 100,
        start_date: project.decorate.start_at,
        duration: project.decorate.duration
        #send_date: project.start_date,
        #duration: 20
    }
    item[:parent] = "p#{project.parent.id}" if project.parent.present?

    @data_gantt << item

    #item[:start_date] = project.start_date if project.start_date


    #subject_for_project(project, options) unless options[:only] == :lines
    #line_for_project(project, options) unless options[:only] == :subjects
    #options[:top] += options[:top_increment]
    #options[:indent] += options[:indent_increment]
    #@number_of_rows += 1
    #return if abort?
    issues = @gantt.project_issues(project).select {|i| i.fixed_version.nil?}

    #item.merge!({ , due_date: project.due_date})


    sort_issues!(issues)
    if issues
      add_issues(issues, options)
      #return if abort?
    end
    versions = @gantt.project_versions(project)
    versions.each do |version|
      add_version(project, version, options)
    end
    # Remove indent to hit the next sibling
    #options[:indent] -= options[:indent_increment]
  end

  def add_issues(issues, options={})
    @issue_ancestors = []
    add_version = "v#{options[version.id]}" if options[:version]
    issues.each do |issue|
      item = {
          #id: "i#{issue.id}#{add_version}",
          id: issue.id,
          text: view_context.link_to_issue(issue),
          #parent: issue.parent.nil? ? (options[:version] ? "v#{options[:version].id}" : "p#{issue.project.id}") : "i#{issue.id}#{add_version}",
          parent: issue.parent.nil? ? issue.project.id : issue.id,
          issue: 1,
          closed_on: issue.closed_on,
          is_private: issue.is_private,
          priority: issue.priority_id,
          start_date: issue.decorate.start_at,
          duration: issue.decorate.duration,
          progress: issue.done_ratio / 10,
          #due_date: issue.due_date,
          #completed_percent: issue.completed_percent
      }
      @data_gantt << item
      #subject_for_issue(i, options) unless options[:only] == :lines
      #line_for_issue(i, options) unless options[:only] == :subjects
      #options[:top] += options[:top_increment]
      #@number_of_rows += 1
      #break if abort?
    end
    #options[:indent] -= (options[:indent_increment] * @issue_ancestors.size)
  end

  def add_version(project, version, options={})
    if version.is_a?(Version) && version.due_date && version.start_date
      #label = "#{h version} #{h version.completed_percent.to_i.to_s}%"
      #label = h("#{version.project} -") + label unless @project && @project == version.project
      item = {
          id: "v#{version}",
          text: view_context.link_to_version(version).html_safe,
          version:1,
          project:1,
          parent: "p#{project.id}",
          open: version.status == 'open',#options[:level] == 1 ? 1 : 0,
          start_date: version.decorate.start_at,
          duration: version.decorate.duration,
          progress: version.completed_percent / 100
      }
      @data_gantt << item
      # Version header
      #subject_for_version(version, options) unless options[:only] == :lines
      #line_for_version(version, options) unless options[:only] == :subjects
      #options[:top] += options[:top_increment]
      #@number_of_rows += 1
      #return if abort?
      issues = version_issues(project, version)
      if issues
        sort_issues!(issues)
        # Indent issues
        #options[:indent] += options[:indent_increment]
        options[:version] = version
        add_issues(issues, options)
        #options[:indent] -= options[:indent_increment]
      end
    end
  end

  private
  def sort_issues!(issues)
    issues.sort! { |a, b| gantt_issue_compare(a, b) }
  end

  def gantt_issue_compare(x, y)
    if x.root_id == y.root_id
      x.lft <=> y.lft
    else
      x.root_id <=> y.root_id
    end
  end

end
