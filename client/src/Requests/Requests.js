import React from 'react'
import { Grid, Row, Button, PageHeader, Panel, ListGroup, ListGroupItem, Label } from 'react-bootstrap'
import { Link } from 'react-router'
import { Loading } from '../shared/Loading'
import ghClient from '../shared/githubClient'

class Requests extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      issues: [],
    }
    this.getIssues = this.getIssues.bind(this)
  }

  componentDidMount() {
    this.getIssues({ labels: ['request', this.props.params.tagName].join(), state: 'all' })
  }

  getIssues(issueOptions) {
    return ghClient.gh.getIssues(this.props.params.orgName, this.props.params.repoName)
      .listIssues(issueOptions)
      .then(response => {
        this.setState({
          issues: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err))
  }

  render() {
    const {pathname} = this.props
    return (
      <Grid>
        <Row>
          <PageHeader>
            {`Project Name here `}
            <Link to={`${this.props.location.pathname}/new/request`}>{
              ({isActive, location, href, onClick, transition}) =>
                <Button onClick={onClick}>
                  New Request
              </Button>
            }</Link>
          </PageHeader>
        </Row>
        {(this.state.isLoading) ? (
          <Loading />
        ) : (
            <Panel defaultExpanded header={`${this.state.issues.length} open issues`}>
              <ListGroup fill>
                {this.state.issues.map(i => (
                  <Link key={i.number} to={`${pathname}/${i.number}`}>{
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
          )}
      </Grid>)
  }
}

export default Requests


const IssueInfo = (props) => (
  <span>
    {`${props.issue.title} - ${props.issue.user.login} `}
    {props.issue.labels.map(l => <Tag key={l.name} label={l} />)}
  </span>
)

const Tag = props => {
  const {label} = props
  if (label.name === "bug") return <Label bsStyle="danger" style={{ backgroundColor: label.color }}>{label.name}</Label>
  if (label.name === "enhancement") return <Label style={{ backgroundColor: label.color }}>{label.name}</Label>

  return null
}