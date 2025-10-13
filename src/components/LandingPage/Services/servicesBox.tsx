import React from 'react';
import comingSoon from '../../../assets/images/ServicesImages/comingSoon.svg';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

interface ServicesBoxProps {
  key?: string | number;
  bgColor: string;
  textColor: string;
  title: string;
  description: string;
  link?: string;
  img: string;
  comingSoon?: boolean;
  facebook_Link?: string;
  instagram_Link?: string;
  tiktok_Link?: string;
}

const ServicesBox: React.FC<ServicesBoxProps> = (props) => {
  return (
    <div className={`services-box overflow-hidden relative rounded-3xl p-8 min-h-[350px]`} 
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor
      }}
    >
      <div className='flex flex-col sm:items-start items-center text-center sm:text-start sm:w-2/3 relative z-50'>
        <h2 className='mb-2 whitespace-pre-line text-3xl'>{props.title}</h2>
        <p className='mb-6 text-lg'>{props.description}</p>
        {!props.link ? (
          <div className="flex flex-row items-center gap-3 mt-6 text-2xl text-gray-700 transition-all">
            {props.facebook_Link && (
              <a className='hover:text-[#6017DC] transition-all' href={props.facebook_Link}>
                <FaFacebook />
              </a>
            )}
            {props.instagram_Link && (
              <a className='hover:text-[#6017DC] transition-all' href={props.instagram_Link}>
                <FaInstagram />
              </a>
            )}
            {props.tiktok_Link && (
              <a className='hover:text-[#6017DC] transition-all' href={props.tiktok_Link}>
                <FaTiktok />
              </a>
            )}
          </div>
        ) : !props.comingSoon ? (
          <a href={`Services${props.link}`} className="rounded-full py-3 px-6 bg-white text-black font-bold border border-white hover:bg-transparent hover:text-white transition">Read More</a>
        ) : (
          <span className="rounded-full py-3 px-6 bg-white text-black font-bold border border-white cursor-default">Coming Soon..</span>
        )}
      </div>
      <img src={props.img} className='absolute bottom-0 right-0 max-sm:relative max-sm:mx-auto sm:block' alt="service Img" />
      {props.comingSoon ? (
        <img src={comingSoon} className='absolute top-4 right-0 max-sm:relative max-sm:mx-auto sm:block' alt="comingSoon" />
      ) : null}
    </div>
  );
};

export default ServicesBox;