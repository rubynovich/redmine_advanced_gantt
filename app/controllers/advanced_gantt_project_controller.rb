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
    @gantt = Redmine::Helpers::Gantt.new(params)
    @gantt.project = @project
    retrieve_query
    @query.group_by = nil
    @gantt.query = @query if @query.valid?
    basename = (@project ? "#{@project.identifier}-" : '') + 'gantt'
    @data_gantt ||= []
    #@links_gantt ||= []
    @links_hash ||= {}
    Project.project_tree(@gantt.projects) do |project, level|
      add_project(project, {:level => level})
    end
    #@data_gantt_ids = {}
    #@data_gantt_reverse_ids = {}
    #i = 0
    #@data_gantt.each do |item|
    #  if @data_gantt_ids[item[:id]].nil?
    #    i += 1
    #    @data_gantt_ids[item[:id]] = i
    #    @data_gantt_reverse_ids[i.to_s] = item[:id]
    #    item[:id] = i
    #  end
    #  item[:parent] = @data_gantt_ids[item[:parent]]
    #end

    #Project

    #data_one = [
    #
    #    {"id" => 161, "text" => "<a href=\"/projects/generas\">&quot;Одиннадцатый участок &quot; (Румянцево)</a>", "progress" =>  0.4, "open" =>  false, "priority" => 0, "project" => 1 },
    #
    #    {"id" => 2, "text" => "Office facing", "start_date" => "02-04-2013", "duration" => "8", "progress" => 0.5, "parent" => 161, "open" =>  false},
       # {"id":3, "text":"Furniture installation", "start_date":"11-04-2013", "duration":"8", "order":"20", "parent":"1", "progress": 0.6, "open": true, "priority":1 },
       # {"id":4, "text":"The employee relocation", "start_date":"13-04-2013", "duration":"6", "order":"30", "parent":"1", "progress": 0.5, "open": true, "priority":1 },
    #]

    gon.data_gantt = {data: @data_gantt, links: @links_hash.map{|k,v| v}, data_one: @data_gantt }
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
        id: "p#{project.id}",
        text: view_context.link_to_project(project).html_safe,
        project:1,
        priority: project.level,
        open: true,
        status: project.status,
        #open: project.status == '1', #options[:level] == 1 ? 1 : 0,
        progress: (project.completed_percent(:include_subprojects => true) / 100),
        start_date: project.decorate.start_at,
        duration: project.decorate.duration,
        scale_height: 20
    }
    item[:parent] = "p#{project.parent.id}" if project.parent.present?

    @data_gantt << item

    issues = @gantt.project_issues(project).select {|i| i.fixed_version.nil?}


    sort_issues!(issues)
    if issues
      add_issues(issues, options)
      #return if abort?
    end
    versions = @gantt.project_versions(project)
    versions.each do |version|
      add_version(project, version, options)
    end

  end

  def add_issues(issues, options={})
    @issue_ancestors = []
    add_version = "v#{options[version.id]}" if options[:version]
    issues.each do |issue|
      item = {
          id: "i#{issue.id}#{add_version}",
          priority: issue.level+issue.project.level+1,
          #id: issue.id,
          text: view_context.link_to_issue(issue),
          rightside_text: view_context.link_to_issue(issue),
          parent: issue.parent.nil? ? (options[:version] ? "v#{options[:version].id}" : "p#{issue.project.id}") : "i#{issue.parent.id}#{add_version}",
          #parent: issue.parent.nil? ? issue.project.id : issue.parent.id,
          issue: 1,
          open: true,
          closed_on: issue.closed_on,
          status: issue.status_id,
          is_private: issue.is_private,
          priority: issue.priority_id,
          start_date: issue.decorate.start_at,
          duration: issue.decorate.duration,
          progress: (issue.done_ratio / 100),
          tooltip: %{#{view_context.render_issue_tooltip(issue).html_safe}<br>
          }.html_safe

      }
      @data_gantt << item
      issue.relations.each do |relation|
        if @links_hash["id#{relation.id}"].nil?
          @links_hash["id#{relation.id}"] = {
              id: relation.id,
              source: relation.decorate.back ? "i#{relation.issue_to_id}#{add_version}" : "i#{relation.issue_from_id}#{add_version}",
              target: relation.decorate.back ? "i#{relation.issue_from_id}#{add_version}" : "i#{relation.issue_to_id}#{add_version}",
              type: relation.decorate.type,
              redmine_type: relation.relation_type
          }
        end
      end
        #
    end
  end

  def add_version(project, version, options={})
    if version.is_a?(Version) && version.due_date && version.start_date
      #label = "#{h version} #{h version.completed_percent.to_i.to_s}%"
      #label = h("#{version.project} -") + label unless @project && @project == version.project
      item = {
          id: "v#{version}",
          text: view_context.link_to_version(version).html_safe,
          version:1,
          parent: "p#{project.id}",
          open: true,
          status: version.status,
          #open: version.status == 'open',#options[:level] == 1 ? 1 : 0,
          start_date: version.decorate.start_at,
          duration: version.decorate.duration,
          progress: version.completed_percent / 100
      }
      @data_gantt << item

      issues = version_issues(project, version)
      if issues
        sort_issues!(issues)
        options[:version] = version
        add_issues(issues, options)
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
