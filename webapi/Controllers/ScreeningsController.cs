using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using webapi.Data;
using System.Globalization;
using webapi.Entities;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScreeningsController : GenericController<Screening>
    {
        public ScreeningsController(FilmvisarnaContext context) : base(context)
        {
        }
        private static CultureInfo sv = new("sv-SE");

        private static string GetDateTime(DateTime dateTime) => dateTime.ToLocalTime().ToString("f", sv);
        private static string GetAbbrevDayOfWeek(DateTime dateTime) => dateTime.ToLocalTime().ToString("f", sv).Substring(0, 3);
        private static string GetDayAndMonth(DateTime dateTime) => dateTime.ToLocalTime().ToString("m", sv);
        private static string GetTime(DateTime dateTime) => dateTime.ToLocalTime().ToString("t", sv);



        //Get every screening available for one specific movie
        // 
        //          Theater Join is not optimized !!
        [HttpGet("movie/{movieId}/")]
        public async Task<IActionResult> GetMovieScreenings(int movieId)
        {
            var movieInfo = await _context.movies
                .Where(m => m.Id == movieId)
                .Select(m => new
                {
                    MovieName = m.Name,
                    Screenings = m.Screenings.Select(s => new
                    {
                        Id = s.Id,
                        DayOfWeek = GetAbbrevDayOfWeek(s.DateAndTime),
                        DayAndMonth = GetDayAndMonth(s.DateAndTime),
                        Time = GetTime(s.DateAndTime),
                        TheaterId = s.Theater.Id,
                        TheaterName = s.Theater.Name
                    })
                    .ToList()

                })
                .FirstOrDefaultAsync();

            if (movieInfo == null)
            {
                return NotFound();
            }

            return Ok(movieInfo);
        }

        //Get one specific screening for one specific movie
        [HttpGet("{movieId}/{screeningsId}")]
        public async Task<IActionResult> GetSpecificMovieScreenings(int movieId, int screeningsId)
        {
            var movieInfo = await _context.movies
                .Where(m => m.Id == movieId)
                .Select(m => new
                {
                    MovieName = m.Name,
                    Screenings = m.Screenings.Where(s => s.Id == screeningsId)
                    .Select(s => new
                    {
                        DateAndTime = GetDateTime(s.DateAndTime)
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (movieInfo == null)
            {
                return NotFound();
            }
            return Ok(movieInfo);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookedSeatsForScreening(int id)
        {
            var result = await _context.screenings
                .Where(v => v.Id == id)
                .Select(v => new
                {
                    Id = v.Id,
                    Theater = v.Theater.Name,
                    TheaterId = v.Theater.Id,
                    Movie = v.Movie.Name,
                    TotalSeatsInTheater = v.Theater.Seats.Count(),
                    BookedSeats = v.Bookings
                        .SelectMany(b => b.BookingXSeats)
                        .Select(bxs => new
                        {
                            SeatId = bxs.SeatId,
                            Seat = bxs.Seat.seat,
                            Row = bxs.Seat.Row
                        })
                })
                .FirstOrDefaultAsync();

            return Ok(result);
        }
    }
}
