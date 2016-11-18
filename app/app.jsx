import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import tasksDb from './data/TasksDatastore.jsx';
import projectsDb from './data/ProjectsDatastore.jsx';

import ToolbarHeader from './components/navigation/ToolbarHeader.component.jsx';
import Navbar from './components/navigation/Navbar.component.jsx';

import TaskList from './components/tasks/TaskList.component.jsx';
import CreateTaskDialog from './components/tasks/CreateTaskDialog.component.jsx';
import ProjectList from './components/projects/ProjectList.component.jsx';
import CreateProjectDialog from './components/projects/CreateProjectDialog.component.jsx';


class Main extends Component {

    constructor(props){
        super();
        this.state={
            activeItem: "tasks",
            dbFilter: "all",
        }
    }

    //TODO problem with tag search, is that when we switch page we update app.jsx and this will override our dbFilter and already upadted Task list
    componentDidUpdate(){
        if (this.state.activeItem === "tasks") {
            this.refs.taskList.refreshTasks();
        } else if (this.state.activeItem === "projects") {
            this.refs.projectsList.refreshProjects();
        }
    }

    /**
    * Create a desktop notification
    * @param {String} title - notification title
    * @param {String} body - notification body
    */
    notify(title, body){
        new Notification(title, {
            body: body
        });
    }

    render(){
        return (
            <div className="window">
                <CreateTaskDialog ref="createTaskDialog" parent={this} tasksDb={tasksDb} projectsDb={projectsDb}/>
                <CreateProjectDialog ref="createProjectDialog" parent={this} projectsDb={projectsDb}/>
                <div className="window-content">
                    <div className="pane-group">
                        <div className="pane-sm sidebar draggable">
                            <Navbar ref="navbar" parent={this} tasksDb={tasksDb}/>
                        </div>
                        <div className="pane main-content" id="mainPane">
                            {this.state.activeItem === 'tasks' ? (
                                <TaskList ref="taskList" parent={this} tasksDb={tasksDb} projectsDb={projectsDb} dbFilter={this.state.dbFilter} />
                            ) : this.state.activeItem === 'projects' ? (
                                <ProjectList ref="projectsList" parent={this} tasksDb={tasksDb} projectsDb={projectsDb} dbFilter={this.state.dbFilter}/>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

var main = document.getElementById('main');
ReactDOM.render(<Main />, main);
