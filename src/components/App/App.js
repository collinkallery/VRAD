import  React, {Component} from 'react';
import './App.css';
import Login from '../Login/Login'
import AreaContainer from '../AreaContainer/AreaContainer'
import ListingContainer from '../ListingContainer/ListingContainer';
import ListingDetails from '../ListingDetails/ListingDetails.js';
import {Route, Redirect} from "react-router-dom";


// import { render } from '@testing-library/react';

class App extends Component {
  constructor() {
    super();
    this.mounted = false;
    this.state = {
      current: 'login',
      areas: [],
      listings: [],
      userInfo: {
        name: '',
        email: '',
        purpose: ''
      },
      isLoggedIn: true,
    }
  }

  componentDidMount() {
    this.mounted = true;
    fetch('https://vrad-api.herokuapp.com/api/v1/areas')
      .then(response => response.json())
      .then(areaData => {
        const areaPromises = areaData.areas.map(area => {
          return fetch(`https://vrad-api.herokuapp.com${area.details}`)
            .then(response => response.json())
            .then(info => {
              return {
                area: area.area,
                details: area.details,
                id: info.id,
                name: info.name,
                location: info.location,
                about: info.about,
                region_code: info.region_code,
                quick_search: info.quick_search,
                listings: info.listings
              }
            })
        })
        Promise.all(areaPromises)
          .then(completeAreaData => this.setState({areas: completeAreaData}))
      })
      .catch(err => console.error(err))
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setUserInfo = ({name, email, purpose}) => {
    this.setState({
      userInfo: {
        name,
        email,
        purpose
      },
      isLoggedIn: true
    })
  }

  findArea = (id) => {
    return this.state.areas.find(area => {
      return area.id === parseInt(id)
    });
  }

  findListing = async (url) => {
    const response = await fetch(`https://vrad-api.herokuapp.com${url}`)
    const listing = await response.json()
    return listing
  }

  render() {
    return (
      <div className="App">
        {!this.state.isLoggedIn ?
          <Redirect to="/" /> :
          <Redirect to="/Areas" />}
          <Route
          path='/Areas/:id/Listings'
          exact
          render={({match}) => {
            const { id } = match.params;
            const areaToRender = this.findArea(id)
            return <ListingContainer {...areaToRender} />
        }} />

        <Route
        path='/Areas/:areaId/Listings/:listingId/ListingDetails'
        exact
        render={async ({match}) => {
          const {areaId, listingId} = await match.params;
          const area = await this.findArea(areaId)
          const listingUrl = await area.listings.find(listing => listing.includes(listingId))
          const listing = await this.findListing(listingUrl);
          console.log(listing)
          return <ListingDetails {...listing} />
        }} />
        <Route exact path="/Areas" render={() => <AreaContainer areas={this.state.areas} />} />
        <Route exact path='/' render={() => <Login setUserInfo={this.setUserInfo} />}/>
      </div>
    );
  }
}

export default App;
