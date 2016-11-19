import React from 'react';
import $ from 'jquery';
import './home.css';


class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      amazonToken: ''
    };
  }

  componentDidMount() {
    const amzToken = localStorage.getItem('amazon-token') ? localStorage.getItem('amazon-token') : 
      ((((window.location.href).split('='))[1]).split('&'))[0];
    this.setState({ amazonToken: amzToken });
    localStorage.setItem('amazon-token', amzToken);
    // console.log('local storage', localStorage.getItem('amazon-token'));
  }

  render() {
    return (
    <div className='home'>
      <h1>Home Page!</h1>
    </div>
    );
  }

}


export default Home;