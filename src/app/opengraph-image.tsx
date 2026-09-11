import { ImageResponse } from 'next/og';
export const alt='Better SEO — Search data. Clear priorities.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:72,background:'#f6f9fc',color:'#0d253d',fontFamily:'sans-serif'}}><div style={{display:'flex',fontSize:30,fontWeight:700,color:'#533afd'}}>Better SEO</div><div style={{display:'flex',flexDirection:'column',gap:16}}><div style={{fontSize:74,fontWeight:700,letterSpacing:-3}}>Search data.</div><div style={{fontSize:74,fontWeight:700,letterSpacing:-3}}>Clear priorities.</div></div><div style={{display:'flex',fontSize:25,color:'#536477'}}>Search Console · Analytics · Technical SEO · Content</div></div>,size);}
