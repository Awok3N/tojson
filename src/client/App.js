import React, { Component } from "react";
import "./app.css";
import ReactJson from 'react-json-view';
import { Container,Input,Dropdown , Button} from 'semantic-ui-react'

const options = [
  { key: 'RSS', text: 'RSS', value: 'RSS' },
  { key: 'XML', text: 'XML', value: 'XML' },
]

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
            url: '',
            data: '',
            status: '',

    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();

    this.fetchData();
    
  }
 
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
 
  fetchData(){
    fetch('http://localhost:8080/api?feed=' + this.state.url)
    .then((response) => {
        return response.json()})
        .then((json) => {
            if(json != undefined){
              this.setState({data: json});
              
            }
            if(json.status != undefined){
              this.setState({status: json.status});
            }
        })
    
  }
  showUrl(){
    if(this.state.url){
    return 'http://localhost:8080/api?feed=' + this.state.url;
    }
  }

  render() {
    return (
      <div>
        <div className="input-site">
        <Input
            label={<Dropdown defaultValue='RSS' options={options} />}
            labelPosition='left'
            placeholder='Enter what you wanna convert to JSON'
            className="full-width"
            name="url"
            value={this.state.url}
            onChange={this.handleChange}
            type="text"
          />
        <div className="button-convert">
          <Button positive className="full-width" onClick={this.handleClick}>Convert</Button>
          </div>
        </div>
        <div className="url-box">
          <a href={this.showUrl()}>{this.showUrl()} </a>
        </div>
        <div className="json-block">
         <Container textAlign='left'>
        
            <ReactJson src={this.state.data} />
          </Container>
        </div>
      </div>
    );
  }
}
