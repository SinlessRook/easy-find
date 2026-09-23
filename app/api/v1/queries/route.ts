import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const createQuerySchema = z.object({
	title: z.string().trim().min(3, 'The title needs at least 3 characters').max(150, 'The title can be at most 150 characters'),
	description: z.string().trim().max(2000, 'The description can be at most 2000 characters').nullable().optional(),
	contact_num: z.string().trim().max(40, 'The contact number is too long').nullable().optional(),
	expiry_date: z.coerce.date().refine((value) => value.getTime() > Date.now(), 'Expiry date must be in the future'),
})

function errorResponse(status: number, code: string, message: string, fields?: Record<string, string>) {
	return NextResponse.json(
		{ error: { code, message, ...(fields ? { fields } : {}) } },
		{ status }
	)
}

export async function GET() {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('queries')
		.select(`
			id,
			title,
			description,
			contact_num,
			created_at,
			expiry_date,
			created_by,
			users (
				username
			)
		`)
		.gt('expiry_date', new Date().toISOString())
		.order('created_at', { ascending: false })

	if (error) {
		console.error('GET /api/v1/queries failed:', error)
		return errorResponse(500, 'server_error', error.message || 'Could not load queries.')
	}

	const formattedData = (data ?? []).map((query) => {
		const user = Array.isArray(query.users) ? query.users[0] : query.users
		const created_by = user?.username ?? null

		const { users, ...rest } = query

		return {
			...rest,
			created_by,
		}
	})

	return NextResponse.json({ data: formattedData })
}

export async function POST(request: Request) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return errorResponse(401, 'unauthorized', 'Please sign in to post a query.')

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return errorResponse(400, 'invalid_json', 'The request body must be valid JSON.')
	}

	const parsed = createQuerySchema.safeParse(body)
	if (!parsed.success) {
		const fields: Record<string, string> = {}
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0] ?? 'body')
			if (!fields[key]) fields[key] = issue.message
		}
		return errorResponse(400, 'validation_error', 'Some fields are invalid.', fields)
	}

	const { title, description, contact_num, expiry_date } = parsed.data
	if (expiry_date.getTime() > Date.now() + 7 * 24 * 60 * 60 * 1000) {
		return errorResponse(400, 'validation_error', 'Some fields are invalid.', {
			expiry_date: 'Expiry date cannot be more than 7 days from now.',
		})
	}

	const { data, error } = await supabase
		.from('queries')
		.insert({
			created_by: user.id,
			title,
			description: description || null,
			contact_num: contact_num || null,
			expiry_date: expiry_date.toISOString(),
		})
		.select('id, title, description, created_by, contact_num, created_at, expiry_date')
		.single()

	if (error) {
		console.error('POST /api/v1/queries failed:', error)
		return errorResponse(500, 'server_error', 'Could not create the query.')
	}

	return NextResponse.json({ data }, { status: 201 })
}
