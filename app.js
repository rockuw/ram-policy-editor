'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var RuleEditor = React.createClass({
  getInitialState: function () {
    return {
      Effect: '',
      Action: [],
      Resource: []
    };
  },
  handleEffectChange: function (e) {
    this.setState({Effect: e.target.value});
  },
  handleActionChange: function (e) {
    this.setState({Action: e.target.value.split(',')});
  },
  handleResourceChange: function (e) {
    this.setState({Resource: e.target.value.split(',')});
  },
  handleSubmit: function (e) {
    e.preventDefault();

    this.props.onRuleSubmit(this.state);
    this.setState({
      Effect: '',
      Action: [],
      Resource: []
    });
  },

  render: function () {
    return (
        <div className="RuleEditor">
        <h2>Add rule:</h2>
        <form onSubmit={this.handleSubmit}>
        <input
      type="text"
      placeholder="Effect"
      value={this.state.Effect}
      onChange={this.handleEffectChange}
        />
        <input
      type="text"
      placeholder="Action"
      value={this.state.Action.join()}
      onChange={this.handleActionChange}
        />
        <input
      type="text"
      placeholder="Resource"
      value={this.state.Resource.join()}
      onChange={this.handleResourceChange}
        />
        <input type="submit" value="Add" />
        </form>
        </div>
    );
  }
});

var Rule = React.createClass({
  render: function () {
    return (
        <tr>
        <td>{this.props.effect}</td>
        <td>{this.props.actions}</td>
        <td>{this.props.resources}</td>
        </tr>
    );
  }
});

var RuleList = React.createClass({
  render: function () {
    var rules = this.props.data.Statement.map(function(r) {
      return (
          <Rule effect={r.Effect} actions={r.Action.join()} resources={r.Resource.join()} />
      );
    });
    return (
        <div className="RuleList">
        <h2>Rule list:</h2>
        <table>
        <tr>
        <th>Effect</th>
        <th>Action</th>
        <th>Resource</th>
        </tr>
        {rules}
        </table>
        </div>
    );
  }
});

var PolicyView = React.createClass({
  render: function () {
    return (
        <div className="PolicyView">
        <h2>Policy JSON:</h2>
        <textarea rows="30" cols="60" value={JSON.stringify(this.props.data, null, 2)} />
        </div>
    );
  }
});

var PolicyEditor = React.createClass({
  getInitialState: function () {
    return {data: {
      "Version": "1",
      "Statement": []
    }};
  },

  handleRuleSubmit: function (rule) {
    var newPolicy = this.state.data;
    newPolicy.Statement = newPolicy.Statement.concat([rule]);
    this.setState({data: newPolicy});
  },

  render: function () {
    return (
        <div className="policyEditor">
        <RuleEditor data={this.state.data} onRuleSubmit={this.handleRuleSubmit} />
        <RuleList data={this.state.data} />
        <PolicyView data={this.state.data} />
        </div>
    );
  }
});

ReactDOM.render(
    <PolicyEditor />,
  document.getElementById('policy-editor')
);
