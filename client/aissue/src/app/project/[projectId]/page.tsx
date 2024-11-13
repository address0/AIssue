'use clinet'

export default function projectDetailPage({
  params,
}: {
  params: {
    projectId: string
  }
}) {
  const { projectId } = params
  return (
    <div>
      <p>{projectId}</p>
      <h1>projectDetail</h1>
    </div>
  )
}
