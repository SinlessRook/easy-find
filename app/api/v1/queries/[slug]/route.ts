import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function errorResponse(status: number, code: string, message: string) {
	return NextResponse.json({ error: { code, message } }, { status })
}

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
	const { slug: id } = await params
	if (!UUID.test(id)) return errorResponse(404, 'not_found', 'Query not found.')

	const supabase = await createClient()
	const { data, error } = await supabase
		.from('queries')
		.select('id, title, description, created_by, contact_num, created_at, expiry_date')
		.eq('id', id)
		.maybeSingle()

	if (error) {
		console.error('GET /api/v1/queries/[id] failed:', error)
		return errorResponse(500, 'server_error', 'Could not load the query.')
	}
	if (!data) return errorResponse(404, 'not_found', 'Query not found.')

	return NextResponse.json({ data })
}

async function deleteQuery({ params }: RouteContext) {
	const { slug: id } = await params
	if (!UUID.test(id)) return errorResponse(404, 'not_found', 'Query not found.')

	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return errorResponse(401, 'unauthorized', 'Please sign in to delete a query.')

	const { data, error } = await supabase
		.from('queries')
		.delete()
		.eq('id', id)
		.eq('created_by', user.id)
		.select('id')
		.maybeSingle()

	if (error) {
		console.error('DELETE /api/v1/queries/[id] failed:', error)
		return errorResponse(500, 'server_error', 'Could not delete the query.')
	}
	if (!data) return errorResponse(404, 'not_found', 'Query not found or you do not own it.')

	return NextResponse.json({ data: { id, deleted: true } })
}

// The requested POST endpoint is a delete action for clients that use POST-only mutations.
export async function POST(_request: Request, context: RouteContext) {
	return deleteQuery(context)
}

export async function DELETE(_request: Request, context: RouteContext) {
	return deleteQuery(context)
}
