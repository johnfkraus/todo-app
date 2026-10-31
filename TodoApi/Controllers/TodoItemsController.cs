using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TodoItemsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TodoItemsController> _logger;

    public TodoItemsController(AppDbContext context, ILogger<TodoItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/TodoItems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
    {
        return await _context.TodoItems.AsNoTracking().OrderBy(t => t.Id).ToListAsync();
    }

    // GET: api/TodoItems/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
    {
        var todoItem = await _context.TodoItems.FindAsync(id);
        if (todoItem is null)
        {
            return NotFound();
        }
        return todoItem;
    }

    // POST: api/TodoItems
    [HttpPost]
    public async Task<ActionResult<TodoItem>> CreateTodoItem(TodoItem todoItem)
    {
        if (string.IsNullOrWhiteSpace(todoItem.Title))
        {
            return BadRequest("Title is required.");
        }

        todoItem.Id = 0; // let SQL Server assign the identity value
        _context.TodoItems.Add(todoItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
    }

    // PUT: api/TodoItems/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTodoItem(int id, TodoItem todoItem)
    {
        if (id != todoItem.Id)
        {
            return BadRequest("Id in URL does not match body.");
        }

        var existing = await _context.TodoItems.FindAsync(id);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Title = todoItem.Title;
        existing.IsComplete = todoItem.IsComplete;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/TodoItems/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTodoItem(int id)
    {
        var todoItem = await _context.TodoItems.FindAsync(id);
        if (todoItem is null)
        {
            return NotFound();
        }

        _context.TodoItems.Remove(todoItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
