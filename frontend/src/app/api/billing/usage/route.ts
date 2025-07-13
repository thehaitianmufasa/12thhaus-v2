import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // TODO: Implement GraphQL queries to fetch usage data
    // Example queries:
    /*
    const [usersData, projectsData, workflowsData, tenantData] = await Promise.all([
      executeGraphQL({
        query: `
          query GetUserCount($tenantId: uuid!) {
            users_aggregate(where: { tenant_id: { _eq: $tenantId } }) {
              aggregate {
                count
              }
            }
          }
        `,
        variables: { tenantId }
      }),
      executeGraphQL({
        query: `
          query GetProjectCount($tenantId: uuid!) {
            projects_aggregate(where: { tenant_id: { _eq: $tenantId } }) {
              aggregate {
                count
              }
            }
          }
        `,
        variables: { tenantId }
      }),
      executeGraphQL({
        query: `
          query GetWorkflowCount($tenantId: uuid!) {
            workflows_aggregate(where: { tenant_id: { _eq: $tenantId } }) {
              aggregate {
                count
              }
            }
          }
        `,
        variables: { tenantId }
      }),
      executeGraphQL({
        query: `
          query GetTenantLimits($tenantId: uuid!) {
            tenants_by_pk(id: $tenantId) {
              max_users
              max_projects
              max_workflows
            }
          }
        `,
        variables: { tenantId }
      })
    ]);
    */

    // Mock data for now - replace with actual database queries
    const mockUsage = {
      users: {
        current: 3,
        limit: 10,
      },
      projects: {
        current: 8,
        limit: 25,
      },
      workflows: {
        current: 15,
        limit: -1, // Unlimited for pro plan
      },
    };

    return NextResponse.json(mockUsage);
  } catch (error) {
    console.error('Failed to fetch usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}