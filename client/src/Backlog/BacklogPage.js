import React from 'react';
import {Match} from 'react-router';
import { Grid } from 'react-bootstrap'
import OrgSelector from './OrgSelector'
import TeamSelector from './TeamSelector'
import TeamRepos from './TeamRepos'

 const BacklogPage = ({pathname}) => (
    <Grid>
      <Match pattern={`${pathname}/:orgName/:teamId/:milestoneName`} component={TeamRepos}/>
      <Match pattern={`${pathname}/:orgName/:teamId`} component={TeamRepos}/>
      <Match pattern={`${pathname}/:orgName/`} exactly component={TeamSelector}/>

      <Match pattern={pathname} exactly component={OrgSelector}/>
    </Grid>
 )

export default BacklogPage;