'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var MultiSelect = require('react-bootstrap-multiselect');
var TagsInput = require('react-tagsinput');

var EffectList = [
  'Allow',
  'Deny'
];

var ActionList = [
  {
    label: 'General',
    children: [
      'oss:*',
      'oss:Get*',
      'oss:Put*',
      'oss:List*'
    ],
  },
  {
    label: 'Object',
    children: [
     'oss:GetObject',
     'oss:PutObject',
     'oss:DeleteObject',
     'oss:GetObjectAcl',
     'oss:PutObjectAcl',
     'oss:ListParts',
     'oss:AbortMultipartUpload',
      'oss:ListObjects',
    ]
  },
  {
    label: 'Bucket',
    children: [
      'oss:PutBucket',
      'oss:DeleteBucket',
      'oss:GetBucketLocation',
      'oss:ListMultipartUploads',
      'oss:PutBucketAcl',
      'oss:GetBucketAcl',
      'oss:PutBucketReferer',
      'oss:GetBucketReferer',
      'oss:PutBucketLogging',
      'oss:GetBucketLogging',
      'oss:DeleteBucketLogging',
      'oss:PutBucketWebsite',
      'oss:GetBucketWebsite',
      'oss:DeleteBucketWebsite',
      'oss:PutBucketLifecycle',
      'oss:GetBucketLifecycle',
      'oss:DeleteBucketLifecycle',
      'oss:PutBucketCors',
      'oss:GetBucketCors',
      'oss:DeleteBucketCors',
      'oss:PutBucketReplication',
      'oss:GetBucketReplication',
      'oss:DeleteBucketReplication',
      'oss:GetBucketReplicationLocation',
      'oss:GetBucketReplicationProgress'
    ]}
];

var RuleEditor = React.createClass({
  getInitialState: function () {
    return {
      Effect: 'Allow',
      Action: [],
      Resource: []
    };
  },
  handleEffectChange: function (e) {
    this.setState({Effect: e.target.value});
  },
  handleActionChange: function (e) {
    var actions = new Set(this.state.Action);
    if (e[0].selected) {
      actions.add(e[0].value);
    } else {
      actions.delete(e[0].value);
    }
    this.setState({Action: Array.from(actions)});
  },
  handleResourceChange: function (e) {
    this.setState({Resource: e});
  },
  handleSubmit: function (e) {
    e.preventDefault();

    var r = this.props.onRuleSubmit(this.state);
    if (r) {
      this.setState({
        Effect: EffectList[0],
        Action: [],
        Resource: []
      });
    }
  },

  render: function () {
    var self = this;
    var selectEffect = EffectList.map(function (x) {
      return (<option value={x}>{x}</option>);
    });

    var selectAction = ActionList.map(function (group) {
      var selected = new Set(self.state.Action);
      return ({
        label: group.label,
        children: group.children.map(function (x) {
          return (
            {value: x, selected: selected.has(x)}
          )
        })
      });
    });

    return (
        <div className="ruleEditor">
        <h2>Add rule:</h2>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="form-group">
        <label className="col-sm-2 control-label">Effect</label>
        <div className="col-sm-10">
        <select className="form-control" defaultValue={EffectList[0]} onChange={this.handleEffectChange}>
          {selectEffect}
        </select>
        </div>
        </div>

        <div className="form-group">
        <label className="col-sm-2 control-label">Actions</label>
        <div className="col-sm-10">
        <MultiSelect multiple maxHeight={300} data={selectAction} onChange={this.handleActionChange} />
        </div>
        </div>

        <div className="form-group">
        <label className="col-sm-2 control-label">Resources</label>
        <div className="col-sm-10">
        <TagsInput value={this.state.Resource} onChange={this.handleResourceChange} />
        </div>
        </div>

        <div className="form-group">
        <div className="col-sm-offset-2 col-sm-10">
        <input type="submit" className="btn btn-default" value="Add" />
        </div>
        </div>
        </form>
        </div>
    );
  }
});

var Rule = React.createClass({
  handleRuleRemove: function (e) {
    e.preventDefault();
    this.props.onRuleRemove(this.props.ruleId);
  },

  render: function () {
    return (
        <tr>
        <td>{this.props.effect}</td>
        <td>{this.props.actions}</td>
        <td>{this.props.resources}</td>
        <td>
          <a href="#" onClick={this.handleRuleRemove}>
            <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
          </a>
        </td>
        </tr>
    );
  }
});

var RuleList = React.createClass({
  render: function () {
    var self = this;
    var rules = self.props.data.Statement.map(function(r) {
      return (
          <Rule
            ruleId={r.RuleId}
            effect={r.Effect}
            actions={r.Action.join()}
            resources={r.Resource.join()}
            onRuleRemove={self.props.onRuleRemove}
          />
      );
    });
    return (
        <div className="ruleList">
        <h2>Rule list:</h2>
        <table className="table">
          <tbody>
          <tr>
            <th>Effect</th>
            <th>Actions</th>
            <th>Resources</th>
            <th></th>
          </tr>
          {rules}
          </tbody>
        </table>
        </div>
    );
  }
});

var PolicyView = React.createClass({
  render: function () {
    var policy = this.props.data;
    policy.Statement = policy.Statement.map(function (x) {
      return ({
        Effect: x.Effect,
        Action: x.Action,
        Resource: x.Resource
      });
    });

    return (
        <div className="policyView">
        <h2>Policy JSON:</h2>
        <textarea className="form-control" rows="20" cols="60" value={JSON.stringify(policy, null, 2)} />
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
    if (rule.Action.length === 0 || rule.Resource.length === 0) {
      console.error('Invalid rule to add: %j', rule);
      return false;
    }
    var newPolicy = this.state.data;
    rule.RuleId = Date.now();
    newPolicy.Statement = newPolicy.Statement.concat([rule]);
    this.setState({data: newPolicy});
    return true;
  },

  handleRuleRemove: function (id) {
    var newPolicy = this.state.data;
    newPolicy.Statement = newPolicy.Statement.filter(function (x) {
      return x.RuleId != id;
    });
    this.setState({data: newPolicy});
  },

  render: function () {
    return (
        <div className="policyEditor">
        <div className="row">
        <div className="col-md-6">
        <RuleEditor data={this.state.data} onRuleSubmit={this.handleRuleSubmit} />
        <RuleList data={this.state.data} onRuleRemove={this.handleRuleRemove} />
        </div>

        <div className="col-md-6">
        <PolicyView data={this.state.data} />
        </div>
        </div>
        </div>
    );
  }
});

ReactDOM.render(
    <PolicyEditor />,
  document.getElementById('policy-editor')
);
