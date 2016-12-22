import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Panel, Image, Row, Col } from 'react-bootstrap';
import './dashboardStyles.css';

const mapStateToProps = function(state) {
  return {
    account: state.account,
    children: state.children,
    chores: state.chores
  };
};

class Dashboard extends Component {
  createChoreList(chore) {
    const completedIcon = {
      true: 'glyphicon glyphicon-ok',
      false: 'glyphicon glyphicon-remove'
    };
    return (
      <Panel>
        <div className='date'>{chore.date}</div>
        <span className={completedIcon[chore.completed]}></span>
        <span className='choreTitle'> {chore.title} - </span>
        <span className='choreDetails'>{chore.details}</span>
      </Panel>
    );
  }

  createChildrenList() {
    if (Object.keys(this.props.chores.list).length === 0) {
      return (
        <li>
          Loading...
        </li>
      );
    }

    const avatarUrl = 'http://resourcecenter4u.com/wp-content/uploads/2015/01/avatar.png';

    return (
      Object.keys(this.props.children).map((child) => {
        return (
          <Col md={6}>
            <Panel header={this.props.children[child].name} bsStyle='info'>
              <Row>
                <Col xs={2}>
                  <Image src={this.props.children[child].photo || avatarUrl} className='avatar' rounded/>
                </Col>
                <Col xs={10}>
                  {this.props.chores.list[child].map((chore) => this.createChoreList(chore))}
                </Col>
              </Row>
            </Panel>
          </Col>
        );
      })
    );
  }

  createChildren() {
    if (Object.keys(this.props.children).length === 0) {
      return (
        <li>
          Loading...
        </li>
      );
    }

    const avatarUrl = 'http://resourcecenter4u.com/wp-content/uploads/2015/01/avatar.png';

    return (
      Object.keys(this.props.children).map((child) => {
        return (
          <Col md={6}>
            <Panel header={this.props.children[child].name} bsStyle='info'>
              <Row>
                <Col xs={2}>
                  <Image src={this.props.children[child].photo || avatarUrl} className='avatar' rounded/>
                </Col>
              </Row>
            </Panel>
          </Col>
        );
      })
    );
  }

  render() {
    return (
      <div>
        <h1>{this.props.account.username ? this.props.account.username + '\'s Dashboard' : ''}</h1>
        <br/>
        <hr/>
        <br/>
        <Row>
          <Col xs={1} />
          <Col xs={10}>
            <Row>
              {this.createChildrenList()}
            </Row>
          </Col>
          <Col xs={1} />
        </Row>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
