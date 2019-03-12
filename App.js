import React from 'react';
import { createDrawerNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import { SecureStore } from 'expo';
import Login from './login/Login';
import Parts from './admin/Parts';
import Employee from './employee/Employee';
import Employees from './admin/Employees';
import Admin from './admin/Admin';
import Station from './employee/Station';
import WorkStations from './admin/WorkStations';
import WorkOrders from './admin/WorkOrders';
import Axios from 'axios';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1';

EmployeeNavigator = createStackNavigator(
  {
    Home: Employee,
    Station: Station,
    "Log out": () => {
      Axios.post(`${api}/auth/logout`);
      return <Login />
    }
  },
  {
    initialRouteName: 'Home'
  },
)

EmployeeContainer = createAppContainer(EmployeeNavigator);

AdminNavigator = createDrawerNavigator(
  {
    Overview: Admin,
    "Work Stations": WorkStations,
    Parts: Parts,
    WorkOrders: WorkOrders,
    Employees: Employees,
  },
  {
    initialRouteName: 'Overview'
  }
)

AdminContainer = createAppContainer(AdminNavigator);



export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      isLoggedIn: false,
      isAdmin: false,
      err: null
    }
  }

  handleUsernameChange = text => this.setState({ email: text });
  handlePasswordChange = text => this.setState({ password: text });

  login = () => {
    Axios.post(`${api}/auth/login`, {
      email: this.state.email,
      password: this.state.password
    })
      .then(result => {
        if (result.data.err) {
          this.setState({ err: result.data.err });
          return;
        }
        const userInfo = {
          isAdmin: result.data.isAdmin,
          uid: result.data.uid,
          token: result.data.token,
          username: result.data.name
        }
        const str = JSON.stringify(userInfo);
        global.uInfo = str;

        SecureStore.deleteItemAsync('userInfo')
          .then(() => SecureStore.setItemAsync('userInfo', str));
        this.setState({ isAdmin: result.data.isAdmin, isLoggedIn: true })
      })
      .catch(err => this.setState({ err }))
  }

  render() {
    if (!this.state.isLoggedIn) {
      return (
        <Login
          username={this.state.username}
          handleUsernameChange={this.handleUsernameChange}
          password={this.state.password}
          handlePasswordChange={this.handlePasswordChange}
          login={this.login}
          err={this.state.err}
        />
      )
    }
    else if (this.state.isLoggedIn && this.state.isAdmin)
      return <AdminContainer />
    else
    return <EmployeeContainer />
  }
}

