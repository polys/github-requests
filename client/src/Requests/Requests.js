import React from 'react'
import { Grid, Button, PageHeader, Panel, ListGroup, ListGroupItem, Label } from 'react-bootstrap'
import { Match, Miss, Link } from 'react-router';
import _ from 'lodash'
import { Loading } from '../shared/Loading'
import ghClient from '../shared/githubClient'
import { getCreator } from '../shared/requestUtils'
import NewRequest from './NewRequest'
import PanelIssue from './PanelIssue'
import moment from 'moment'

class Requests extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      issues: [],
    }
    this.getIssues = this.getIssues.bind(this)
    this.findIssue = this.findIssue.bind(this)
  }

  componentDidMount() {
    const labels = ['user request']
    if (this.props.params.label !== this.props.params.repo)
      labels.push(this.props.params.label)
    this.getIssues({ labels: labels.join(), state: 'open' })
  }

  getIssues(issueOptions) {
    this.setState({
      isLoading: true
    });
    return ghClient.gh.getIssues(this.props.params.organisation, this.props.params.repo)
      .listIssues(issueOptions)
      .then(response => {
        this.setState({
          issues: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err))
  }

  findIssue(issueNumber) {
    return _.find(this.state.issues, i => i.number === parseInt(issueNumber, 10))
  }

  render() {
    const {pathname, params, ...rest} = this.props
    const newRequestButton = params && (!params.issueNumber || params.issueNumber !== 'new') && (
      <Link to={`/requests/${params.organisation}/${params.repo}/${params.label}/new`}>{
        ({isActive, location, href, onClick, transition}) =>
          <Button onClick={onClick} bsStyle="default" bsSize="large">
            New Request
              </Button>
      }</Link>
    )

    return (
      <Grid>
        <div>
          <PageHeader>
            <Match pattern={`/requests/:organisation/:repo/:label/:issueNumber`} exactly render={({params}) => <Link to={`/requests/${params.organisation}/${params.repo}/${params.label}`}><small className="back-link-container"><i className="fa fa-chevron-circle-left" /></small></Link>} />
            <Match pattern={`/requests/:organisation/:repo/:label`} exactly render={() => <Link to="/requests"><small className="back-link-container"><i className="fa fa-chevron-circle-left" /></small></Link>} />
            { }
            {this.props.project.name}
            <span className="pull-right">
              {' '}
              {newRequestButton}
              {' '}
              {rest.isAdmin && <a href={`http://github.com/${params.organisation}/${params.repo}`} target="_blank"><i className="fa fa-github fa-lg" /></a>}
              {' '}
            </span>
          </PageHeader>
        </div>
        {
          (this.state.isLoading) ? (
            <Loading />
          ) : (
              <div>
                <Match pattern={`/requests/:organisation/:repo/:label/:issueNumber`} exactly render={(matchProps) => (
                  <div>
                    <Match pattern={`${pathname}/new`} exactly render={(childProps) => (
                      <NewRequest
                        {...matchProps}
                        isAdmin={rest.isAdmin}
                        userProfile={rest.userProfile}
                        project={rest.project}
                        onIssueCreated={this.getIssues} />
                    )} />
                    <Miss render={() => (
                      <PanelIssue
                        {...matchProps}
                        isAdmin={rest.isAdmin}
                        userProfile={rest.userProfile}
                        project={rest.project}
                        issue={this.findIssue(matchProps.params.issueNumber)} />
                    )} />
                  </div>
                )} />
                <Match pattern={pathname} exactly render={() => (
                  <RequestPanel {...this.props} isAdmin={rest.isAdmin} userProfile={rest.userProfile} project={rest.project} issues={this.state.issues} />
                )} />
              </div>
            )
        }
      </Grid >)
  }
}

Requests.defaultProps = {
  project: { name: '' }
}

export default Requests

const RequestPanel = props => (
  <Panel defaultExpanded header={`${props.issues.length} open issues`} bsStyle="default">
    <ListGroup fill>
      {props.issues.map(i => (
        <Link key={i.number} to={`${props.pathname}/${i.number}`}>{
          ({isActive, location, href, onClick, transition}) => (
            <ListGroupItem onClick={onClick} href={href}>
              <IssueInfo issue={i} />
            </ListGroupItem>
          )
        }</Link>
      )
      )}
    </ListGroup>
  </Panel>
)

const IssueInfo = (props) => (
  <span>
    <strong>{props.issue.title}</strong><small className="text-muted"> submitted <i>{moment(props.issue.created_at).fromNow()}</i> by <i>{`${getCreator(props.issue).name || getCreator(props.issue).login}`}</i></small><span className="text pull-right">{props.issue.labels.map(l => <Tag key={l.name} label={l} />)}</span>
  </span>
)

const Tag = props => {
  const {label} = props
  if (label.name === "bug") return <Label bsStyle="danger">{label.name}</Label>
  if (label.name === "enhancement") return <Label bsStyle="success">{label.name}</Label>

  return null
}
