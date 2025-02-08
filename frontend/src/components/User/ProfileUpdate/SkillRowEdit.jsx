import Axios from 'axios'
import { useState, useEffect } from 'react'
import SearchableDropdown from './SearchableDropdown'
import CloseIcon from '../../../assets/CloseIcon.jsx'

export default function SkillRowEdit({ dataType, dataVal, preSaveUserData, setPreSaveUserData }) {
    const [includedSkills, setIncludedSkills] = useState([...dataVal])
    const [excludedSkills, setExcludedSkills] = useState([])
    const keyValPairCss = "w-full flex justify-between my-5"

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}skills`)
                
                const selectedIds = includedSkills.map(skill => skill._id)
                
                const otherCategory = dataType === 'skills' ? 'interests' : 'skills'
                const selectedOtherOptions = preSaveUserData?.[otherCategory] || []
                const otherSelectedIds = selectedOtherOptions.map(skill => skill._id)
                
                const availableOptions = response.data.filter(skill => 
                    !selectedIds.includes(skill._id) && !otherSelectedIds.includes(skill._id)
                )
                setExcludedSkills(availableOptions)
            } catch (error) {
                console.error("Error fetching skills: ", error)
            }
        }

        fetchSkills()
    }, [preSaveUserData, includedSkills, dataType])

    useEffect(() => {
        setPreSaveUserData(prev => ({ ...prev, [dataType]: [...includedSkills] }))
    }, [includedSkills, dataType, setPreSaveUserData])

    const handleSkillRemove = (skill) => {
        setExcludedSkills(prev => [...prev, skill])
        setIncludedSkills(prevList => prevList.filter(thisSkill => thisSkill._id !== skill._id))
        console.log(`Removed ${skill.name}`)
    }

    const handleSkillAdd = (skill) => {
        setExcludedSkills(prevList => prevList.filter(thisSkill => thisSkill._id !== skill._id))
        setIncludedSkills(prev => [...prev, skill])
        console.log(`Added ${skill.name}`)
    }

    return (
        <div className={keyValPairCss}>
            <label className='text-lg text-black dark:text-gray-200 font-bold mr-6'>{dataType}</label>

            <div className="flex flex-col">
                <div className="flex flex-wrap justify-end">
                    {includedSkills.map((element, key) => {
                        return (
                            <label key={key} skillid={element._id} className='flex items-center rounded-full text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium text-sm pl-4 pr-2.5 py-2.5 text-center me-2 mb-2'>
                                {element.name}
                                <button onClick={() => handleSkillRemove(element)} className="text-black text-sm pl-1 font-black">
                                    <CloseIcon />
                                </button>
                            </label>
                        );
                    })}
                </div>

                <div className="flex p-3 justify-end">
                    <SearchableDropdown options={excludedSkills} onSelect={handleSkillAdd} />
                </div>
            </div>

        </div>
    )
}