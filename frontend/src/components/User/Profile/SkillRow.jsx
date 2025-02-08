export default function SkillRow({dataType, dataVal}) {
    const keyValPairCss = "w-full my-2 flex flex-col justify-left"

    return (
        <div className={keyValPairCss}>
            <label className='mb-3 text-sm text-gray-500'>{dataType}</label>
            <div className="flex flex-wrap">
                {dataVal.map((element, key) => {
                    return <label key={key} className='rounded-full text-gray-900 bg-green-600 text-white px-4 py-2 text-sm mr-2 mb-2 hover:bg-green-700'>{element.name}</label>
                })}
            </div>
        </div>
    )
}