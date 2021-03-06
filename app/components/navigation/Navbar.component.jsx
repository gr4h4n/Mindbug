import React, {Component} from 'react';
import {observer} from 'mobx-react';
import moment from 'moment';

import Tag from './Tag.component.jsx';


@observer
export default class Navbar extends Component {

    constructor(props){
        super();
        this.state ={
            activeItem: "tasks",
            activeChildItem: "all",
        }
    }

    /**
    * Switch to a specific page with a specific filterTasks
    * @param {String} pageName - parent page name
    * @param {String} dbFilter - child filter; default=""
    */
    goTo(pageName, dbFilter=""){
        //Set active item in the navbar
        this.setState({
            activeItem: pageName,
            activeChildItem: dbFilter
        });

        let filterToSet;
        let activeItem = pageName; //used to
        switch (pageName){
            case 'general':
                if(dbFilter === 'today'){
                    //Find all undone tasks and open projects which due date is today
                    activeItem = 'today';
                    filterToSet = {$or: [{$and: [{dueDate: {$gte:  moment().startOf('day').toDate(), $lt: moment().endOf('day').toDate()}}, {done:false}]},{$and: [{dueDate: {$gte:  moment().startOf('day').toDate(), $lt: moment().endOf('day').toDate()}}, {open:true}]}]};
                } else if (dbFilter === 'inbox'){
                    activeItem = 'inbox'; //Overwrite activeItem when inbox is seletected
                    filterToSet = {inbox:true};
                } else if (dbFilter === 'search') {
                    activeItem = 'search'; //Overwrite activeItem when inbox is seletected
                    filterToSet = {done:false};
                }
                break;
            case 'tasks':
                if(dbFilter === 'all'){
                    filterToSet = {done:false};
                } else if(dbFilter === 'done'){
                    filterToSet = {done:true};
                } else if(dbFilter === 'starred') {
                    filterToSet = {starred:true};
                } else if(dbFilter === 'deleted') {
                    filterToSet = {$$deleted:true};
                }
                break;
            case 'projects':
                if(dbFilter === 'all'){
                    filterToSet = {open:true};
                } else if(dbFilter === 'done'){
                    filterToSet = {done:true};
                } else if(dbFilter === 'starred') {
                    filterToSet = {starred:true};
                } else if(dbFilter === 'deleted') {
                    filterToSet = {deleted:true};
                }
                break;
            default: break;
        }


        //Set active item in the main component
        this.props.parent.setState({ //app
            activeItem: activeItem,
            dbFilter: filterToSet,
        });
    }

    /**
    * Opens the task creation dialog
    */
    openTaskDialog(){
        this.props.parent.refs.createTaskDialog.showModal();
    }

    /**
    * Opens the proejct creation dialog
    */
    openProjectDialog(){
        this.props.parent.refs.createProjectDialog.showModal();
    }

    /**
    * Checks if a item and a child item is activeItem
    * @param {String} activeItem - active item name to check
    * @param {String} activeChildItem - active child item name to check
    * @return {bool} bool - true/false
    */
    isActiveState(activeItem, activeChildItem){
        return this.state.activeItem === activeItem && this.state.activeChildItem === activeChildItem ? true : false;
    }

    render(){
        if(this.props.db.tags){
            return(
                <aside className="menu noSelect">
                    <p className="menu-label ">
                        General
                    </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('general', 'inbox')} className={this.isActiveState('general', 'inbox') ? 'is-active': null }><i className="fa fa-inbox" aria-hidden="true"></i>Inbox <span className="tag inbox-tag">{this.props.db.totalInbox}</span></a></li>
                        <li><a href="#" onClick={()=>this.goTo('general', 'today')} className={this.isActiveState('general', 'today') ? 'is-active': null }><i className="fa fa-clock-o" aria-hidden="true"></i>Today</a></li>
                        <li><a href="#" onClick={()=>this.goTo('general', 'search')} className={this.isActiveState('general', 'search') ? 'is-active': null }><i className="fa fa-search" aria-hidden="true"></i>Search</a></li>
                    </ul>
                    <p className="menu-label">
                        Tasks <a className="pull-right add-btn" onClick={()=>this.openTaskDialog()}><i className="fa fa-plus" aria-hidden="true"></i></a>
                    </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('tasks', 'all')} className={this.isActiveState('tasks', 'all') ? 'is-active': null }><i className="fa fa-tasks" aria-hidden="true"></i>All</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','done')} className={this.isActiveState('tasks', 'done') ? 'is-active': null }><i className="fa fa-check" aria-hidden="true"></i>Done</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','starred')} className={this.isActiveState('tasks', 'starred') ? 'is-active': null }><i className="fa fa-star" aria-hidden="true"></i>Starred</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','deleted')} className={this.isActiveState('tasks', 'deleted') ? 'is-active': null }><i className="fa fa-trash" aria-hidden="true"></i>Deleted</a></li>
                    </ul>
                        <p className="menu-label">
                            Projects <a className="pull-right add-btn" onClick={()=>this.openProjectDialog()}><i className="fa fa-plus" aria-hidden="true"></i></a>
                        </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('projects','all')} className={this.isActiveState('projects','all') ? 'is-active': null }><i className="fa fa-briefcase" aria-hidden="true"></i>All</a></li>
                        <li><a href="#" onClick={()=>this.goTo('projects','starred')} className={this.isActiveState('projects','starred') ? 'is-active': null }><i className="fa fa-star" aria-hidden="true"></i>Starred</a></li>
                        <li><a href="#" onClick={()=>this.goTo('projects','deleted')} className={this.isActiveState('projects','deleted') ? 'is-active': null }><i className="fa fa-trash" aria-hidden="true"></i>Deleted</a></li>
                    </ul>
                    <p className="menu-label">
                        Tags
                    </p>
                    <ul className="menu-list tag-list">
                         {this.props.db.tags.map((tag)=>{
                            return <li key={tag}><Tag name={tag} parent={this}/></li>
                        })}
                    </ul>
                </aside>
            )
        } else {
            return (
                <aside className="menu draggable">
                    <p className="menu-label">
                        General
                    </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('general', 'inbox')} className={this.isActiveState('general', 'inbox') ? 'is-active': null }><i className="fa fa-inbox" aria-hidden="true"></i>Inbox <span className="tag inbox-tag"></span></a></li>
                        <li><a href="#" onClick={()=>this.goTo('general', 'today')} className={this.isActiveState('general', 'today') ? 'is-active': null }><i className="fa fa-clock-o" aria-hidden="true"></i>Today</a></li>
                        <li><a href="#" onClick={()=>this.goTo('general', 'search')} className={this.isActiveState('general', 'search') ? 'is-active': null }><i className="fa fa-search" aria-hidden="true"></i>Search</a></li>
                    </ul>
                    <p className="menu-label">
                        Tasks <a className="pull-right add-btn" onClick={()=>this.openTaskDialog()}><i className="fa fa-plus" aria-hidden="true"></i></a>
                    </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('tasks', 'all')} className={this.isActiveState('tasks', 'all') ? 'is-active': null }><i className="fa fa-tasks" aria-hidden="true"></i>All</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','done')} className={this.isActiveState('tasks', 'done') ? 'is-active': null }><i className="fa fa-check" aria-hidden="true"></i>Done</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','starred')} className={this.isActiveState('tasks', 'starred') ? 'is-active': null }><i className="fa fa-star" aria-hidden="true"></i>Starred</a></li>
                        <li><a href="#" onClick={()=>this.goTo('tasks','deleted')} className={this.isActiveState('tasks', 'deleted') ? 'is-active': null }><i className="fa fa-trash" aria-hidden="true"></i>Deleted</a></li>
                    </ul>
                        <p className="menu-label">
                            Projects <a className="pull-right add-btn" onClick={()=>this.openProjectDialog()}><i className="fa fa-plus" aria-hidden="true"></i></a>
                        </p>
                    <ul className="menu-list">
                        <li><a href="#" onClick={()=>this.goTo('projects','all')} className={this.isActiveState('projects','all') ? 'is-active': null }><i className="fa fa-briefcase" aria-hidden="true"></i>All</a></li>
                        <li><a href="#" onClick={()=>this.goTo('projects','starred')} className={this.isActiveState('projects','starred') ? 'is-active': null }><i className="fa fa-star" aria-hidden="true"></i>Starred</a></li>
                        <li><a href="#" onClick={()=>this.goTo('projects','deleted')} className={this.isActiveState('projects','deleted') ? 'is-active': null }><i className="fa fa-trash" aria-hidden="true"></i>Deleted</a></li>
                    </ul>
                    <p className="menu-label">
                        Tags
                    </p>
                    <p className="menu-label">
                        Tags
                    </p>
                    <ul className="menu-list tag-list">
                        <li>No Tags</li>
                    </ul>
                </aside>
            )
        }
    }
}

Navbar.propTypes = {
    parent: React.PropTypes.object.isRequired,
    db: React.PropTypes.object.isRequired,
};
