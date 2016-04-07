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

var ConditionList = [
  'acs:SourceIp',
  'acs:UserAgent',
  'acs:CurrentTime',
  'acs:SecureTransport',
  'oss:Prefix',
  'oss:Delimiter'
];

var RuleEditor = React.createClass({
  getInitialState: function () {
    return {
      Effect: 'Allow',
      Action: [],
      Resource: [],
      Condition: [],
      ShowCondEditor: false,
      Notice: ''
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
  handleConditionSubmit: function (e) {
    if (!e.condValue) {
      console.log('Invalid condition: %j', e);
      this.setState({Notice: 'ERROR: Condition value is empty!'});
      return false;
    }

    var conds = this.state.Condition;
    var cond = {
      condId: Date.now(),
      condKey: e.condKey,
      condValue: e.condValue
    };
    conds = conds.concat([cond]);
    this.setState({Condition: conds, Notice: ''});
    return true;
  },
  handleConditionRemove: function (id) {
    var conds = this.state.Condition.filter(function (x) {
      return x.condId != id;
    });
    this.setState({Condition: conds});
  },
  showCondEditor: function (e) {
    e.preventDefault();
    if (this.state.ShowCondEditor) {
      this.setState({ShowCondEditor: false});
    } else {
      this.setState({ShowCondEditor: true});
    }
  },
  handleSubmit: function (e) {
    e.preventDefault();

    var r = this.props.onRuleSubmit(this.state);
    if (!r) {
      this.setState({
        Effect: EffectList[0],
        Action: [],
        Resource: [],
        Condition: [],
        Notice: ''
      });
    } else {
      this.setState({Notice: 'ERROR: ' + r});
    }
  },

  render: function () {
    var self = this;
    var selectEffect = EffectList.map(function (x) {
      return (<option key={x} value={x}>{x}</option>);
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
              <select
                  className="form-control"
                  value={this.state.Effect}
                  onChange={this.handleEffectChange}>
                {selectEffect}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="col-sm-2 control-label">Actions</label>
            <div className="col-sm-10">
              <MultiSelect
                  multiple
                  maxHeight={300}
                  data={selectAction}
                  onChange={this.handleActionChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-sm-2 control-label">Resources</label>
            <div className="col-sm-10">
              <TagsInput
                  value={this.state.Resource}
                  onChange={this.handleResourceChange}
              />
              <div className="hint">
                <ul>
                  <li>Press ENTER after add each resource</li>
                  <li>{'Example: my-bucket/dir/*, acs:oss:*:1234:my-bucket/*'}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="col-sm-2 control-label">Conditions (Optional)</label>
            <div className="col-sm-10">
              <button
                  className="btn btn-default dropdown-toggle"
                  onClick={this.showCondEditor}>
                {this.state.ShowCondEditor ? 'Hide' : 'Show'}
              </button>
              <ConditionEditor
                  data={this.state}
                  onConditionSubmit={this.handleConditionSubmit}
                  onConditionRemove={this.handleConditionRemove}
              />
            </div>
          </div>

          <div className="notice">
            {this.state.Notice}
          </div>

          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <input type="submit" className="btn btn-primary" value="Add rule" />
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
    var actions = this.props.actions.map(function (x) {
      return (<div key={x}>{x}</div>);
    });

    var resources = this.props.resources.map(function (x) {
      return (<div key={x}>{x}</div>);
    });

    var conds = this.props.conditions;
    var conditions = Object.keys(conds).map(function (k) {
      return (
        <div key={conds[k].condKey}>
          {conds[k].condKey} : {conds[k].condValue}
        </div>
      );
    });
    return (
      <tr>
        <td>{this.props.effect}</td>
        <td>{actions}</td>
        <td>{resources}</td>
        <td>{conditions}</td>
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
            key={r.RuleId}
            ruleId={r.RuleId}
            effect={r.Effect}
            actions={r.Action}
            resources={r.Resource}
            conditions={r.Condition}
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
              <th>Conditions</th>
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
  handleChange: function () {
  },

  render: function () {
    var policy = {};
    policy.Version = this.props.data.Version;
    policy.Statement = this.props.data.Statement.map(function (x) {
      var conds = {};
      x.Condition.map(function (cond, i) {
        var name = "cond-" + i;
        var value = {};
        value[cond.condKey] = cond.condValue;
        conds[name] = value;
      });

      return ({
        Effect: x.Effect,
        Action: x.Action,
        Resource: x.Resource,
        Condition: conds
      });
    });

    return (
      <div className="policyView">
        <h2>Policy JSON:</h2>
        <textarea className="form-control" rows="20" cols="60"
                  onChange={this.handleChange}
                  value={JSON.stringify(policy, null, 2)} />
      </div>
    );
  }
});

var ConditionRule = React.createClass({
  handleRemove: function (e) {
    e.preventDefault();
    this.props.onConditionRemove(this.props.condId);
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.condKey}</td>
        <td>{this.props.condValue}</td>
        <td>
          <a href="#" onClick={this.handleRemove}>
            <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
          </a>
        </td>
      </tr>
    );
  }
});

var ConditionRuleList = React.createClass({
  render: function () {
    var self = this;
    var conds = self.props.data.Condition.map(function(r) {
      return (
        <ConditionRule
            key={r.condId}
            condId={r.condId}
            condKey={r.condKey}
            condValue={r.condValue}
            onConditionRemove={self.props.onConditionRemove}
        />
      );
    });
    return (
      <div className="condList">
        <h4>Condition list:</h4>
        <table className="table">
          <tbody>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th></th>
            </tr>
            {conds}
          </tbody>
        </table>
      </div>
    );
  }
});

var ConditionRuleEditor = React.createClass({
  getInitialState: function() {
    return {
      condKey: ConditionList[0],
      condValue: ''
    };
  },

  handleKeyChange: function (e) {
    this.setState({condKey: e.target.value});
  },

  handleValueChange: function (e) {
    this.setState({condValue: e.target.value});
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var r = this.props.onConditionSubmit(this.state);
    if (r) {
      this.setState({
        condKey: ConditionList[0],
        condValue: ''
      });
    }
  },

  render: function () {
    var selectKey = ConditionList.map(function (x) {
      return (<option key={x} value={x}>{x}</option>);
    });

    return (
      <div className="conditionRuleEditor">
        <div className="form-group">
          <label className="col-sm-2 control-label">Key</label>
          <div className="col-sm-10">
            <select
                className="form-control"
                value={this.state.condKey}
                onChange={this.handleKeyChange}>
              {selectKey}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 control-label">Value</label>
          <div className="col-sm-10">
            <input
                type="text"
                className="form-control"
                value={this.state.condValue}
                onChange={this.handleValueChange}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <input
                type="submit"
                className="btn btn-info"
                value="Add condition"
                onClick={this.handleSubmit}
            />
          </div>
        </div>
      </div>
    );
  }
});

var ConditionEditor = React.createClass({
  render: function () {
    return (
      <div
          className="conditionEditor"
          style={{display: this.props.data.ShowCondEditor ? 'block' : 'none'}}
      >
        <h4>Add condition:</h4>
        <ConditionRuleEditor
            onConditionSubmit={this.props.onConditionSubmit}
        />

        <ConditionRuleList
            data={this.props.data}
            onConditionRemove={this.props.onConditionRemove}
        />
      </div>
    );
  }
});

var PolicyEditor = React.createClass({
  getInitialState: function () {
    return {
      data: {
        "Version": "1",
        "Statement": []
      }};
  },

  handleRuleSubmit: function (rule) {
    if (rule.Action.length === 0 || rule.Resource.length === 0) {
      console.error('Invalid rule to add: %j', rule);
      return 'Action or Resource is empty!';
    }
    var newPolicy = this.state.data;
    rule.RuleId = Date.now();
    rule.Resource = rule.Resource.map(function (r) {
      if (r.startsWith('acs:')) {
        return  r;
      } else {
        return 'acs:oss:*:*:' + r;
      }
    });

    newPolicy.Statement = newPolicy.Statement.concat([rule]);
    this.setState({data: newPolicy});
    return null;
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
            <RuleEditor
                data={this.state.data}
                onRuleSubmit={this.handleRuleSubmit} />
          </div>

          <div className="col-md-6">
            <PolicyView data={this.state.data} />
          </div>
        </div>
        <div className="row">
          <RuleList
              data={this.state.data}
              onRuleRemove={this.handleRuleRemove}
          />
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <PolicyEditor />,
  document.getElementById('policy-editor')
);
