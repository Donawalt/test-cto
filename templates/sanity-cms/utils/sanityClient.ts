import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

export async function fetchSanityData<T>(
  query: string,
  params?: Record<string, unknown>
): Promise<T> {
  return sanityClient.fetch(query, params)
}

export const queries = {
  allPosts: `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "author": author->name,
    "categories": categories[]->title
  }`,

  postBySlug: `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    body,
    "author": author->{
      name,
      image,
      bio,
      social
    },
    "categories": categories[]->{
      title,
      slug
    },
    mainImage
  }`,

  allAuthors: `*[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    image,
    bio
  }`,

  allCategories: `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }`,

  allProjects: `*[_type == "project"] | order(featured desc, publishedAt desc) {
    _id,
    title,
    slug,
    tagline,
    mainImage,
    technologies,
    demoUrl,
    repoUrl,
    featured
  }`,

  featuredProjects: `*[_type == "project" && featured == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    tagline,
    mainImage,
    technologies,
    demoUrl,
    repoUrl
  }`,

  settings: `*[_type == "settings"][0] {
    title,
    description,
    logo,
    socialLinks,
    seo
  }`,
}
