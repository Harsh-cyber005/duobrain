import React from 'react'

interface TagProps {
    tag: string
}

function Tag({ tag }: TagProps) {
    return (
        <div className='bg-secondaryBtn text-primaryBtn px-2 rounded-lg text-sm flex justify-center items-center cursor-pointer hover:bg-secondaryBtn-hover'>
            #{tag}
        </div>
    )
}

export default Tag